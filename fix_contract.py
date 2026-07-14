import re

with open('contracts/MacroFiLending.py', 'r') as f:
    content = f.read()

# 1. Modify __init__
content = content.replace(
    '        self.macro_summaries[\"global\"] = MacroSummary(',
    '        self.create_lending_pool(\"GLOBAL\", \"USD\", 5.5)\n        self.macro_summaries[\"global\"] = MacroSummary('
)

# 2. Add get_protocol_state
get_protocol_state_code = '''
    @gl.public.view
    def get_protocol_state(self) -> str:
        \"\"\"Retrieves protocol state for external React frontend.\"\"\"
        if 'GLOBAL' not in self.pools:
            return "{}"
        p = self.pools['GLOBAL']
        
        hist = []
        for h in p.history:
            hist.append({
                "id": int(h.log_id),
                "action": h.action,
                "old_rate": int(h.old_rate_bps) / 100.0,
                "new_rate": int(h.new_rate_bps) / 100.0,
                "rate_change": int(h.rate_change_bps) / 100.0,
                "rationale": h.rationale
            })
            
        return json.dumps({
            "current_base_rate": int(p.current_base_rate_bps) / 100.0,
            "last_update_rationale": p.last_update_rationale,
            "update_counter": int(p.update_counter),
            "logs": hist
        })

    @gl.public.write
    def adjust_rates(self, pool_id: str = "GLOBAL") -> bool:'''

content = content.replace(
    '    @gl.public.write\n    def adjust_rates(self, pool_id: str) -> bool:',
    get_protocol_state_code
)

# 3. Modify calculate_risk_score and emergency_freeze
content = content.replace(
    '    @gl.public.write\n    def calculate_risk_score(self, pool_id: str) -> bool:',
    '    @gl.public.write\n    def calculate_risk_score(self, pool_id: str = "GLOBAL") -> bool:'
)

content = content.replace(
    '    @gl.public.write\n    def emergency_freeze(self, pool_id: str) -> bool:',
    '    @gl.public.write\n    def emergency_freeze(self, pool_id: str = "GLOBAL") -> bool:'
)

with open('contracts/MacroFiLending.py', 'w') as f:
    f.write(content)
print('Done!')
