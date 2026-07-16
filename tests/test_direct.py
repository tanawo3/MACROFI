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
