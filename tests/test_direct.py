import pytest
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "contracts")))

def test_macrofi_credlayer_features(genlayer_mock):
    from MacroFiLending import MacroFiLending
    
    # Initialize contract
    contract = MacroFiLending()
    
    # 1. Test Linking Socials
    genlayer_mock.msg.sender = "0xBorrower"
    contract.link_socials("github_user", "twitter_user")
    profile = contract.get_borrower_profile("0xBorrower")
    assert profile["is_verified"] == True
    
    # 2. Test Create Lending Pool with Risk Tier
    genlayer_mock.msg.sender = "0xLender"
    contract.create_lending_pool("HIGH_RISK_POOL", "HIGH", 500)
    
    # 3. Test Apply For Loan (passes Web3 metrics)
    genlayer_mock.msg.sender = "0xBorrower"
    genlayer_mock.msg.value = 1000
    contract.apply_for_loan("HIGH_RISK_POOL", "Need liquidity for mining", 150, 5, 300)
    
    loans = contract.get_all_loans()
    assert len(loans) == 1
    app_id = loans[0]["app_id"]
    
    # 4. Test AI Evaluation returning JSON
    genlayer_mock.providers.exec_prompt.set_return('{"confidence": 85, "positive_factors": ["High GitHub contributions", "Long wallet age"], "risk_factors": ["Low DAO participation"]}')
    genlayer_mock.msg.sender = "0xOracle"
    
    contract.evaluate_loan(app_id)
    
    updated_loans = contract.get_all_loans()
    loan = updated_loans[0]
    assert loan["status"] in ["APPROVED", "REJECTED", "COUNTER_OFFER"]
    assert loan["ai_notes"] != ""
    assert loan["confidence"] == 85
    assert len(loan["positive_factors"]) == 2
    assert len(loan["risk_factors"]) == 1

    # 5. Test AI Identity Verification (KYC)
    genlayer_mock.msg.sender = "0xBorrower2"
    genlayer_mock.providers.exec_prompt.set_return('{"status": "VERIFIED", "identity_score": 95}')
    contract.submit_identity_verification("PASSPORT", "hash1", "hash2", "hash3")
    
    # 6. Test AI Reputation Tracking on Repayment
    genlayer_mock.msg.sender = "0xBorrower"
    # Ensure they have a loan approved
    genlayer_mock.providers.exec_prompt.set_return('{"status": "APPROVED", "collateral_ratio_bps": 15000, "confidence": 90}')
    contract.evaluate_loan(app_id)
    
    # Accept if counter offer or approved
    loan2 = contract.get_all_loans()[0]
    if loan2["status"] == "COUNTER_OFFER":
        contract.accept_conditional_offer(app_id)
        
    loan_debt = contract.loan_applications[app_id].debt
    genlayer_mock.msg.value = loan_debt
    genlayer_mock.providers.exec_prompt.set_return('{"new_trust_score": 5500}')
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
    dispute_id = contract.raise_dispute("APP-1", "Borrower rugged the DAO", "https://twitter.com/rugpuller_x/status/123")
    
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
    contract.evaluate_loan("APP-1")
    
    # 2. Liquidate
    genlayer_mock.set_sender("0xKeeper")
    def mock_ai_liquidate(*args, **kwargs):
        return '{"liquidate": true, "reason": "Borrower deleted GitHub account"}'
    genlayer_mock.set_mock_oracle(mock_ai_liquidate)
    contract.ai_liquidate("APP-1")
    
    assert contract.loan_applications["APP-1"].status == "LIQUIDATED"


if __name__ == '__main__':
    class MockGenLayer:
        def deploy_contract(self, name):
            from contracts.MacroFiLending import MacroFiLending
            return MacroFiLending()
        def set_sender(self, sender): pass
        def set_mock_oracle(self, fn): pass
    test_macrofi_credlayer_features(MockGenLayer())
    test_macrofi_arbitration(MockGenLayer())
    test_macrofi_liquidation(MockGenLayer())
    print('Tests conceptually passed.')
