import os
import re

contract_path = r"C:\Users\omarb\Desktop\genlayer\pending_projects\MACROFI\contracts\MacroFiLending.py"

with open(contract_path, "r", encoding="utf-8") as f:
    code = f.read()

# Add BorrowerProfile dataclass
dataclass_code = """
@allow_storage
@dataclass
class BorrowerProfile:
    wallet: str
    github_handle: str
    twitter_handle: str
    trust_score: u256
    is_verified: bool
    last_updated: u256
"""

code = code.replace(
    "@allow_storage\n@dataclass\nclass LoanApplication:",
    dataclass_code + "\n\n@allow_storage\n@dataclass\nclass LoanApplication:"
)

# Add borrower_profiles tree
code = code.replace(
    "loan_applications: TreeMap[str, LoanApplication]",
    "loan_applications: TreeMap[str, LoanApplication]\n    borrower_profiles: TreeMap[str, BorrowerProfile]"
)

# Replace evaluate_loan completely
old_evaluate = """    @gl.public.write
    def evaluate_loan(self, app_id: str) -> bool:
        \"\"\"Evaluates a loan and approves it using the pool's current rate.\"\"\"
        if app_id not in self.loan_applications:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Loan not found")
        app = self.loan_applications[app_id]
        if app.status != "PENDING":
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Loan is not PENDING")
        
        pool = self.pools[app.pool_id] if app.pool_id in self.pools else self.pools["GLOBAL"]
        rate = int(pool.current_base_rate_bps)
        
        app.status = "APPROVED"
        col = int(app.collateral)
        app.debt = u256(col + (col * rate) // 10000)
        self.loan_applications[app_id] = app
        return True"""

new_evaluate = """    @gl.public.write
    def evaluate_loan(self, app_id: str) -> bool:
        \"\"\"AI evaluates loan for Fraud, Trust, and generates dynamic collateral/counter-offers.\"\"\"
        if app_id not in self.loan_applications:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Loan not found")
        app = self.loan_applications[app_id]
        if app.status != "PENDING":
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Loan is not PENDING")
            
        pool = self.pools[app.pool_id] if app.pool_id in self.pools else self.pools["GLOBAL"]
        rate = int(pool.current_base_rate_bps)
        
        pitch = app.pitch
        borrower = app.borrower
        
        def leader_fn() -> dict:
            prompt = f"Analyze this loan pitch for zero-day fraud and creditworthiness: {pitch}\\nBorrower: {borrower}\\n"
            prompt += "Return JSON exactly like: {'status': 'APPROVED' or 'REJECTED' or 'COUNTER_OFFER', 'collateral_ratio_bps': <int>, 'reason': '<str>'}\\n"
            prompt += "NOTE: A highly trusted borrower gets 8000 (80% under-collateralized). A normal one gets 15000 (150%). Scams must be REJECTED."
            
            analysis = gl.nondet.exec_prompt(prompt, response_format="json")
            if isinstance(analysis, str):
                import json
                try: analysis = json.loads(analysis)
                except: analysis = {"status": "REJECTED", "collateral_ratio_bps": 15000, "reason": "Parse error"}
                
            return {
                "status": analysis.get("status", "REJECTED"),
                "collateral_ratio_bps": analysis.get("collateral_ratio_bps", 15000),
                "reason": str(analysis.get("reason", ""))[:1024]
            }
            
        def validator_fn(leader_res) -> bool:
            if not isinstance(leader_res, gl.vm.Return): return False
            data = leader_res.calldata
            if not isinstance(data, dict): return False
            return data.get("status") in ["APPROVED", "REJECTED", "COUNTER_OFFER"] and isinstance(data.get("collateral_ratio_bps"), int)
            
        decision = gl.vm.run_nondet(leader_fn, validator_fn)
        status = decision["status"]
        col_ratio = decision["collateral_ratio_bps"]
        
        app.ai_notes = decision["reason"]
        
        if status == "REJECTED":
            app.status = "REJECTED"
            # Return collateral
            gl.transfer(app.borrower, int(app.collateral))
            app.collateral = u256(0)
        else:
            app.status = status # Either APPROVED or COUNTER_OFFER
            col = int(app.collateral)
            principal = (col * 10000) // max(1, col_ratio)
            app.debt = u256(principal + (principal * rate) // 10000)
            
        self.loan_applications[app_id] = app
        return True

    @gl.public.write
    def accept_conditional_offer(self, app_id: str) -> bool:
        \"\"\"Allows the borrower to accept an AI counter-offer.\"\"\"
        if app_id not in self.loan_applications:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Loan not found")
        app = self.loan_applications[app_id]
        if str(gl.message.sender_address) != app.borrower:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Unauthorized")
        if app.status != "COUNTER_OFFER":
            raise gl.vm.UserError(f"{ERROR_EXPECTED} No counter offer exists")
            
        app.status = "APPROVED"
        self.loan_applications[app_id] = app
        return True
        
    @gl.public.write
    def link_socials(self, github_handle: str, twitter_handle: str) -> bool:
        \"\"\"Links Web2 social profiles to calculate Trust Score.\"\"\"
        borrower = str(gl.message.sender_address)
        
        def leader_fn() -> dict:
            gh_data = _fetch_url(f"https://github.com/{github_handle}") if github_handle else ""
            prompt = f"Analyze this GitHub profile data for developer credibility: {gh_data}\\n"
            prompt += "Return JSON: {'trust_score': <int 0-10000>, 'reason': '<str>'}"
            analysis = gl.nondet.exec_prompt(prompt, response_format="json")
            if isinstance(analysis, str):
                import json
                try: analysis = json.loads(analysis)
                except: analysis = {"trust_score": 5000, "reason": ""}
            return {
                "trust_score": analysis.get("trust_score", 5000),
                "reason": str(analysis.get("reason", ""))[:500]
            }
            
        def validator_fn(leader_res) -> bool:
            if not isinstance(leader_res, gl.vm.Return): return False
            data = leader_res.calldata
            return isinstance(data, dict) and isinstance(data.get("trust_score"), int)
            
        decision = gl.vm.run_nondet(leader_fn, validator_fn)
        
        prof = BorrowerProfile(
            wallet=borrower,
            github_handle=github_handle,
            twitter_handle=twitter_handle,
            trust_score=u256(decision["trust_score"]),
            is_verified=True,
            last_updated=u256(1)
        )
        self.borrower_profiles[borrower] = prof
        return True"""

code = code.replace(old_evaluate, new_evaluate)

with open(contract_path, "w", encoding="utf-8") as f:
    f.write(code)

print("MacroFiLending.py upgraded successfully!")
