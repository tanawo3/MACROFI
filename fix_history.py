import re

with open('contracts/MacroFiLending.py', 'r') as f:
    content = f.read()

# 1. Remove RateHistoryLog dataclass completely
content = re.sub(r'@allow_storage\n@dataclass\nclass RateHistoryLog:.*?(?=@allow_storage)', '', content, flags=re.DOTALL)

# 2. Change history: DynArray[RateHistoryLog] to history_json: str in Pool
content = content.replace('    history: DynArray[RateHistoryLog]', '    history_json: str')

# 3. Change create_lending_pool where it assigns history=DynArray()
content = content.replace('            history=DynArray()', '            history_json=\"[]\"')

# 4. In get_protocol_state and get_rate_history, read from history_json
content = content.replace(
'''        hist = []
        for h in p.history:
            hist.append({
                "id": int(h.log_id),
                "action": h.action,
                "old_rate": int(h.old_rate_bps) / 100.0,
                "new_rate": int(h.new_rate_bps) / 100.0,
                "rate_change": int(h.rate_change_bps) / 100.0,
                "rationale": h.rationale
            })''',
'''        import json
        try:
            hist = json.loads(p.history_json)
        except:
            hist = []'''
)

content = content.replace(
'''        hist = []
        for h in p.history:
            hist.append({
                "id": int(h.log_id),
                "action": h.action,
                "old_rate": int(h.old_rate_bps) / 100.0,
                "new_rate": int(h.new_rate_bps) / 100.0,
                "rate_change": int(h.rate_change_bps) / 100.0,
                "rationale": h.rationale
            })''',
'''        import json
        try:
            hist = json.loads(p.history_json)
        except:
            hist = []'''
)

# 5. In calculate_risk_score, read from history_json
content = content.replace(
'''        hist = []
        for h in p.history:
            hist.append(f"{h.action} {int(h.rate_change_bps)/100.0}%")''',
'''        import json
        try:
            raw_hist = json.loads(pool.history_json)
        except:
            raw_hist = []
        hist = []
        for h in raw_hist:
            hist.append(f"{h['action']} {h['rate_change']}%")'''
)

# 6. In adjust_rates, handle history_json
old_history_logic = '''        log = RateHistoryLog(
            log_id=pool.update_counter,
            action=action,
            old_rate_bps=u256(old_rate),
            new_rate_bps=u256(new_rate),
            rate_change_bps=u256(change_bps),
            rationale=rationale
        )
        
        # Prepend to DynArray (simulate insert(0)) by rebuilding it
        new_history = DynArray()
        new_history.append(log)
        limit = 19
        for h in pool.history:
            if limit <= 0: break
            new_history.append(h)
            limit -= 1
        pool.history = new_history'''

new_history_logic = '''        log = {
            "id": int(pool.update_counter),
            "action": action,
            "old_rate": old_rate / 100.0,
            "new_rate": new_rate / 100.0,
            "rate_change": change_bps / 100.0,
            "rationale": rationale
        }
        import json
        try:
            current_hist = json.loads(pool.history_json)
        except:
            current_hist = []
        current_hist.insert(0, log)
        current_hist = current_hist[:20]
        pool.history_json = json.dumps(current_hist)'''

content = content.replace(old_history_logic, new_history_logic)

with open('contracts/MacroFiLending.py', 'w') as f:
    f.write(content)
print('Done!')
