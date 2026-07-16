import pytest
import os
import sys

# Proper GenLayer Mock Module
class MockGenLayerModule:
    pass

gl_mod = MockGenLayerModule()
def dummy_decorator(*args, **kwargs): 
    if len(args) == 1 and callable(args[0]): return args[0]
    if len(args) == 2 and callable(args[1]): return args[1]
    return lambda fn: fn
dummy_decorator.payable = dummy_decorator
gl_mod.allow_storage = dummy_decorator
gl_mod.public = type("Public", (), {"write": dummy_decorator, "read": dummy_decorator, "view": dummy_decorator})()
gl_mod.Contract = object
gl_mod.Address = str
gl_mod.u256 = int
gl_mod.TreeMap = dict
gl_mod.DynArray = list
gl_mod.message = type("Msg", (), {"sender_address": "0xSystem", "value": 0})()
gl_mod.vm = type("VM", (), {"run_nondet": lambda self, leader, validator: {"trust_score": 100}, "Return": dict, "UserError": Exception})()
gl_mod.nondet = type("NonDet", (), {"exec_prompt": lambda self, prompt, response_format=None: "{}"})()
gl_mod.transfer = lambda to, amount: None
sys.modules['genlayer'] = gl_mod

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "contracts")))

@pytest.fixture
def genlayer_mock():
    class MockGenLayer:
        def __init__(self):
            class Msg:
                sender_address = "0xSystem"
            self.msg = Msg()
        def deploy_contract(self, name):
            import genlayer as gl
            gl.vm = type("VM", (), {"run_nondet": lambda self, leader, validator: {"trust_score": 100, "status": "VERIFIED", "identity_score": 100}, "Return": dict, "UserError": Exception})()
            gl.nondet = type("NonDet", (), {"exec_prompt": lambda self, prompt, response_format=None: "{}"})()
            
            from contracts.MacroFiLending import MacroFiLending
            c = MacroFiLending.__new__(MacroFiLending)
            c.pools = {}
            c.loan_applications = {}
            c.liquidity_pools = {}
            c.lenders = {}
            c.borrower_profiles = {}
            c.macro_summaries = {}
            c.pool_ids = []
            c.disputes = {}
            c.vouches = {}
            c.proposals = {}
            c.pool_counter = 0
            c.loan_app_counter = 0
            c.dispute_counter = 0
            c.proposal_counter = 0
            c.treasury = "0xTreasury"
            c.protocol_fees = "0"
            c.__init__()
            return c
        def set_sender(self, sender, value=0):
            import genlayer as gl
            gl.message = type("Msg", (), {"sender_address": sender, "value": value})()
        def set_mock_oracle(self, fn):
            import genlayer as gl
            import json
            gl.vm = type("VM", (), {"run_nondet": lambda self, leader, validator: leader(), "run_nondet_unsafe": lambda self, leader, validator: leader(), "Return": type("Return", (), {"calldata": property(lambda self: getattr(self, "_data", None))}), "UserError": Exception})()
            gl.nondet = type("NonDet", (), {"exec_prompt": lambda self, prompt, response_format=None: fn(prompt)})()
            
    return MockGenLayer()

def test_macrofi_credlayer_features(genlayer_mock):
    contract = genlayer_mock.deploy_contract("MacroFiLending")
    
    # 1. Test Linking Socials
    genlayer_mock.set_sender("0xBorrower")
    contract.link_socials("github_user", "twitter_user")
    import json
    profile = json.loads(contract.get_borrower_profile("0xBorrower"))
    assert profile["is_verified"] == True
    
    # 2. Test Create Lending Pool with Risk Tier
    genlayer_mock.set_sender("0xSystem")
    contract.create_lending_pool("HIGH_RISK_POOL", "HIGH", 500)
    
    # 3. Test Apply For Loan (passes Web3 metrics)
    genlayer_mock.set_sender("0xBorrower")
    genlayer_mock.msg.value = 1000
    contract.apply_for_loan("HIGH_RISK_POOL", "Need liquidity for mining", 150, 5, 300)
    
    loans = json.loads(contract.get_all_loans())
    assert len(loans) == 1
    app_id = loans[0]["app_id"]
    
    # 4. Test AI Evaluation returning JSON
    def mock_ai_eval(*args, **kwargs):
        return '{"status": "APPROVED", "confidence": 85, "positive_factors": ["High GitHub contributions", "Long wallet age"], "risk_factors": ["Low DAO participation"]}'
    genlayer_mock.set_mock_oracle(mock_ai_eval)
    genlayer_mock.set_sender("0xOracle")
    
    contract.evaluate_loan(app_id)
    
    updated_loans = json.loads(contract.get_all_loans())
    loan = updated_loans[0]
    assert loan["status"] in ["APPROVED", "REJECTED", "COUNTER_OFFER"]
    assert loan["confidence"] == 85
    assert len(loan["positive_factors"]) == 2
    assert len(loan["risk_factors"]) == 1

    # 5. Test AI Identity Verification (KYC)
    genlayer_mock.set_sender("0xBorrower2")
    def mock_kyc(*args, **kwargs):
        return '{"status": "VERIFIED", "identity_score": 95}'
    genlayer_mock.set_mock_oracle(mock_kyc)
    contract.submit_identity_verification("PASSPORT", "hash1", "hash2", "hash3")
    
    # 6. Test AI Reputation Tracking on Repayment
    genlayer_mock.set_sender("0xBorrower")
    
    loan_debt = contract.loan_applications[app_id].debt
    genlayer_mock.set_sender("0xBorrower", value=loan_debt)
    def mock_repay_ai(*args, **kwargs):
        return '{"new_trust_score": 5500}'
    genlayer_mock.set_mock_oracle(mock_repay_ai)
    contract.repay_loan(app_id, False)

def test_macrofi_arbitration(genlayer_mock):
    contract = genlayer_mock.deploy_contract("MacroFiLending")
    
    # 1. Setup Borrower
    genlayer_mock.set_sender("0xBorrower")
    contract.link_socials("rugpuller", "rugpuller_x")
    contract.submit_identity_verification("PASSPORT", "hash1", "hash2", "hash3")
    
    # 2. Setup Loan
    contract.apply_for_loan("GLOBAL", "Building a great DAO.", 100, 5, 365)
    
    # 3. Raise Dispute
    genlayer_mock.set_sender("0xLender")
    dispute_id = contract.raise_dispute("LOAN-1", "Borrower rugged the DAO", "https://twitter.com/rugpuller_x/status/123")
    
    # 3.5 Submit Defense
    genlayer_mock.set_sender("0xBorrower")
    contract.submit_defense(dispute_id, "I did not rug, the market crashed", "https://github.com/borrower/defense")

    # 4. Mock AI Arbitration
    def mock_ai(*args, **kwargs):
        if "Arbitrator" in args[0]:
            return '{"is_fault": true, "confidence": 95, "notes": "Confirmed rug pull despite defense"}'
        return '{"status": "APPROVED", "collateral_ratio_bps": 8000, "reason": "Ok", "confidence": 90, "positive_factors": [], "risk_factors": []}'
    
    genlayer_mock.set_mock_oracle(mock_ai)
    
    contract.arbitrate_dispute(dispute_id)
    
    # Verify Slashing
    prof = contract.get_borrower_profile("0xBorrower")
    assert '"trust_score": 0' in prof, "Borrower trust score should be slashed to 0"
    
    # Verify Loan Status
    assert contract.disputes[dispute_id].status == "RESOLVED"
    assert contract.disputes[dispute_id].is_fault == True

def test_macrofi_liquidation(genlayer_mock):
    contract = genlayer_mock.deploy_contract("MacroFiLending")
    
    # 1. Setup
    genlayer_mock.set_sender("0xBorrower")
    contract.link_socials("rugpuller", "rugpuller_x")
    contract.apply_for_loan("GLOBAL", "Pitch", 100, 5, 365)
    
    def mock_ai_approve(*args, **kwargs):
        return '{"status": "APPROVED", "collateral_ratio_bps": 15000, "reason": "Ok", "confidence": 90}'
    genlayer_mock.set_mock_oracle(mock_ai_approve)
    contract.evaluate_loan("LOAN-1")
    
    # 2. Liquidate
    genlayer_mock.set_sender("0xKeeper")
    def mock_ai_liquidate(*args, **kwargs):
        return '{"liquidate": true, "reason": "Borrower deleted GitHub account"}'
    genlayer_mock.set_mock_oracle(mock_ai_liquidate)
    contract.ai_liquidate("LOAN-1")
    
    assert contract.loan_applications["LOAN-1"].status == "LIQUIDATED"

def test_macrofi_vouching(genlayer_mock):
    contract = genlayer_mock.deploy_contract("MacroFiLending")
    
    # 1. Setup Vouchers and Borrowers
    genlayer_mock.set_sender("0xSeniorLender")
    contract.link_socials("senior_dev", "senior_x")
    contract.borrower_profiles["0xSeniorLender"].trust_score = 90
    
    genlayer_mock.set_sender("0xJuniorBorrower")
    contract.link_socials("new_dev", "new_x")
    contract.borrower_profiles["0xJuniorBorrower"].trust_score = 10
    
    # 2. Vouch for Junior Borrower
    genlayer_mock.set_sender("0xSeniorLender")
    def mock_ai_vouch(*args, **kwargs):
        return '{"approved": true, "reason": "Verified relationship"}'
    genlayer_mock.set_mock_oracle(mock_ai_vouch)
    
    contract.ai_vouch("0xJuniorBorrower", "We built protocol X together")
    
    # Junior's trust score should boost by 20 (10 -> 30)
    assert int(contract.borrower_profiles["0xJuniorBorrower"].trust_score) == 30
    
    # 3. Junior applies for loan, gets approved, and rugs
    genlayer_mock.set_sender("0xJuniorBorrower")
    contract.apply_for_loan("GLOBAL", "Scam Pitch", 100, 5, 365)
    def mock_ai_approve(*args, **kwargs):
        return '{"status": "APPROVED", "collateral_ratio_bps": 15000, "reason": "Ok", "confidence": 90}'
    genlayer_mock.set_mock_oracle(mock_ai_approve)
    contract.evaluate_loan("LOAN-1")
    
    # Keeper liquidates the scam loan
    genlayer_mock.set_sender("0xKeeper")
    def mock_ai_liquidate(*args, **kwargs):
        return '{"liquidate": true, "reason": "Borrower rugged"}'
    genlayer_mock.set_mock_oracle(mock_ai_liquidate)
    contract.ai_liquidate("LOAN-1")
    
    # 4. Verify cascade slashing
    assert int(contract.borrower_profiles["0xJuniorBorrower"].trust_score) == 0
    # Senior Voucher should be slashed from 90 -> 40 (90 - 50)
    assert int(contract.borrower_profiles["0xSeniorLender"].trust_score) == 40

def test_macrofi_dao(genlayer_mock):
    contract = genlayer_mock.deploy_contract("MacroFiLending")
    
    # 1. Setup a trusted member (Voter)
    genlayer_mock.set_sender("0xVoter")
    contract.link_socials("voter_x", "voter_github")
    contract.borrower_profiles["0xVoter"].trust_score = 100
    
    # 2. Submit Malicious Proposal (Should be blocked by AI)
    genlayer_mock.set_sender("0xAttacker")
    def mock_ai_reject(*args, **kwargs):
        return '{"decision": "reject", "reason": "Malicious attempt to steal funds"}'
    genlayer_mock.set_mock_oracle(mock_ai_reject)
    
    prop_id = contract.submit_proposal("Steal Funds", "Send all GEN to 0xAttacker")
    assert contract.proposals[prop_id].status == "REJECTED_BY_AI"
    
    # 3. Submit Valid Proposal (Should pass AI pre-screening)
    genlayer_mock.set_sender("0xProposer")
    def mock_ai_pass(*args, **kwargs):
        return '{"decision": "pass", "reason": "Valid governance update"}'
    genlayer_mock.set_mock_oracle(mock_ai_pass)
    
    valid_prop = contract.submit_proposal("Update interest rate", "New Constitution: 5% global interest")
    assert contract.proposals[valid_prop].status == "VOTING"
    
    # 4. Vote on Proposal
    genlayer_mock.set_sender("0xVoter")
    contract.vote_proposal(valid_prop, True)
    assert int(contract.proposals[valid_prop].votes_for) == 100
    
    # 5. Execute Proposal
    contract.execute_proposal(valid_prop)
    assert contract.proposals[valid_prop].status == "EXECUTED"
    assert contract.protocol_constitution == "New Constitution: 5% global interest"
if __name__ == '__main__':
    class MockGenLayer:
        def deploy_contract(self, name):
            from contracts.MacroFiLending import MacroFiLending
            return MacroFiLending()
        def set_sender(self, sender): pass
        def set_mock_oracle(self, fn):
            gl.vm.run_nondet = lambda leader, validator: json.loads(fn()) if isinstance(fn(), str) else fn()
            
    test_macrofi_credlayer_features(MockGenLayer())
    test_macrofi_liquidation(MockGenLayer())
    test_macrofi_vouching(MockGenLayer())
    test_macrofi_dao(MockGenLayer())
    print("All direct logic tests passed!")
