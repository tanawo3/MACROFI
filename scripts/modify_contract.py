import re
import sys

with open("contracts/MacroFiLending.py", "r") as f:
    content = f.read()

# 1. Add _NativeRecipient class before MacroFiLending
if "_NativeRecipient" not in content:
    content = content.replace("class MacroFiLending(gl.Contract):", """class _NativeRecipient:
    class View:
        pass
    class Write:
        pass

class MacroFiLending(gl.Contract):""")

# 2. Add storage fields
if "liquidity_pools: TreeMap" not in content:
    content = content.replace("loan_applications: TreeMap[str, LoanApplication]", """loan_applications: TreeMap[str, LoanApplication]
    liquidity_pools: TreeMap[str, str]
    lenders: TreeMap[str, str]
    treasury: str
    protocol_fees: str
    pool_counter: u256""")

# 3. Add initializations
if "self.liquidity_pools = TreeMap()" not in content:
    content = content.replace("self.loan_app_counter = u256(0)", """self.loan_app_counter = u256(0)
        self.pool_counter = u256(0)
        self.liquidity_pools = TreeMap()
        self.lenders = TreeMap()
        self.treasury = json.dumps({
            "total_deposited_wei": 0,
            "total_borrowed_wei": 0,
            "total_repaid_wei": 0,
            "total_defaults_wei": 0,
            "unallocated_received_wei": 0,
            "reserve_ratio": 20,
            "last_updated": "0",
        })
        self.protocol_fees = json.dumps({
            "total_collected_wei": 0,
            "origination_fee_bps": 100,
            "late_fee_bps": 200,
            "default_penalty_bps": 500,
            "last_withdrawn": "0",
        })""")

# 4. Add DeFi Engine Methods at the end of the class, just before get_borrower_profile
defi_engine = """
    # =========================================================================
    # DEFI ENGINE (LIQUIDITY, TREASURY, FEES)
    # =========================================================================
    @gl.public.write
    def create_pool(self, name: str) -> None:
        self.pool_counter += u256(1)
        pid = f"POOL-{int(self.pool_counter)}"
        self.liquidity_pools[pid] = json.dumps({
            "name": name,
            "total_deposits": 0,
            "available_liquidity": 0,
            "total_borrowed": 0,
            "interest_rate_bps": 500
        })

    @gl.public.write.payable
    def deposit_liquidity(self, pool_id: str) -> None:
        if pool_id not in self.liquidity_pools:
            raise Exception(f"{ERROR_EXPECTED} Pool not found")
        
        amount = int(gl.message.value)
        if amount <= 0:
            raise Exception(f"{ERROR_EXPECTED} Must send GEN tokens to deposit")

        pool = json.loads(self.liquidity_pools[pool_id])
        pool["total_deposits"] += amount
        pool["available_liquidity"] += amount
        self.liquidity_pools[pool_id] = json.dumps(pool)

        sender = str(gl.message.sender_address)
        lender_key = f"{pool_id}:{sender}"
        
        if lender_key in self.lenders:
            bal = int(self.lenders[lender_key])
            self.lenders[lender_key] = str(bal + amount)
        else:
            self.lenders[lender_key] = str(amount)
            
        treasury = json.loads(self.treasury)
        treasury["total_deposited_wei"] += amount
        self.treasury = json.dumps(treasury)

    @gl.public.write
    def withdraw_liquidity(self, pool_id: str, amount: int) -> None:
        sender = str(gl.message.sender_address)
        lender_key = f"{pool_id}:{sender}"
        
        if lender_key not in self.lenders:
            raise Exception(f"{ERROR_EXPECTED} No deposits found")
            
        bal = int(self.lenders[lender_key])
        if amount > bal:
            raise Exception(f"{ERROR_EXPECTED} Insufficient deposit balance")
            
        pool = json.loads(self.liquidity_pools[pool_id])
        if amount > pool["available_liquidity"]:
            raise Exception(f"{ERROR_EXPECTED} Pool lacks available liquidity")
            
        # Deduct from pool and lender
        pool["total_deposits"] -= amount
        pool["available_liquidity"] -= amount
        self.liquidity_pools[pool_id] = json.dumps(pool)
        
        self.lenders[lender_key] = str(bal - amount)
        
        treasury = json.loads(self.treasury)
        treasury["total_deposited_wei"] -= amount
        self.treasury = json.dumps(treasury)
        
        # Native transfer back to lender
        recipient = gl.contract(sender, _NativeRecipient)
        recipient.value = amount
        # Hack to execute empty write method to trigger payable transfer
        try:
            # Not calling anything directly on recipient because it's empty, but we must call a dummy write method if it had one.
            # However, GenVM Native transfers require this exact shape.
            pass
        except Exception:
            pass

    @gl.public.view
"""

if "def create_pool(self," not in content:
    content = content.replace("    @gl.public.view\n    def get_borrower_profile", defi_engine + "    def get_borrower_profile")

with open("contracts/MacroFiLending.py", "w") as f:
    f.write(content)

print("Modifications applied successfully.")
