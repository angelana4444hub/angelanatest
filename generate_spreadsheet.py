
import pandas as pd

def calculate_personal_activity_score(
    login_days_7d,
    total_online_minutes_7d,
    game_sessions_7d,
    weekly_total_bet,
    guild_fund_contribution_amount,
    personal_total_bet,
    personal_total_win,
    weekly_recharge,
    tasks_completed_7d,
    tasks_available_7d,
    task_quality_score,
    activity_completion_avg,
    has_activity_this_week,
    public_chat_count_7d,
    private_chat_count_7d,
    guild_chat_count_7d,
    days_since_last_active
):
    # 1. 基礎參與度分數 (權重15%)
    login_frequency_score = (login_days_7d / 7) * 100
    avg_daily_online_minutes = total_online_minutes_7d / login_days_7d if login_days_7d > 0 else 0
    online_duration_score = min(avg_daily_online_minutes / 120 * 100, 100)
    basic_participation_score = (login_frequency_score * 0.6) + (online_duration_score * 0.4)

    # 2. 遊戲貢獻度分數 (權重40%)
    game_participation_score = min(game_sessions_7d / 100 * 100, 100)
    bet_contribution_score = min(10 * (weekly_total_bet / 5000)**0.25 + 60, 100) # Simplified log formula
    
    # Guild Fund Contribution Score
    if guild_fund_contribution_amount >= 100: guild_fund_score = 85
    elif guild_fund_contribution_amount >= 50: guild_fund_score = 70
    elif guild_fund_contribution_amount >= 20: guild_fund_score = 50
    elif guild_fund_contribution_amount >= 1: guild_fund_score = 30
    else: guild_fund_score = 0
    guild_fund_score = min(guild_fund_score + (guild_fund_contribution_amount // 10) * 2, 100)

    platform_contribution = personal_total_bet - personal_total_win
    platform_contribution_rate = (platform_contribution / personal_total_bet) * 100 if personal_total_bet > 0 else 0
    
    if personal_total_bet > 0: # Has betting behavior
        if platform_contribution_rate > 25: platform_revenue_score = 100
        elif 15 <= platform_contribution_rate <= 25: platform_revenue_score = 80
        elif 5 <= platform_contribution_rate < 15: platform_revenue_score = 60
        elif -5 <= platform_contribution_rate < 5: platform_revenue_score = 40
        else: platform_revenue_score = 20
    else: # No betting behavior
        platform_revenue_score = 0

    game_contribution_score = (
        (game_participation_score * 0.2) +
        (bet_contribution_score * 0.3) +
        (guild_fund_score * 0.25) +
        (platform_revenue_score * 0.25)
    )

    # 3. 儲值貢獻度分數 (權重20%)
    recharge_score = min(10 * (weekly_recharge / 500)**0.25 + 65, 100) # Simplified log formula

    # 4. 任務完成度分數 (權重10%)
    task_completion_ratio = tasks_completed_7d / tasks_available_7d if tasks_available_7d > 0 else 0
    task_completion_ratio_score = task_completion_ratio * 100
    task_completion_score = (task_completion_ratio_score * 0.7) + (task_quality_score * 0.3)

    # 5. 活動參與度分數 (權重8%)
    if has_activity_this_week:
        activity_participation_score = activity_completion_avg
    else:
        activity_participation_score = 60

    # 6. 社交互動度分數 (權重7%)
    public_chat_score = min(public_chat_count_7d * 2, 40)
    private_chat_score = min(private_chat_count_7d * 3, 30)
    guild_chat_score = min(guild_chat_count_7d * 4, 60)
    social_interaction_score = (
        (public_chat_score * 0.4) +
        (private_chat_score * 0.3) +
        (guild_chat_score * 0.3)
    )

    # 基礎活躍度分數
    base_activity_score = (
        (basic_participation_score * 0.15) +
        (game_contribution_score * 0.40) +
        (recharge_score * 0.20) +
        (task_completion_score * 0.10) +
        (activity_participation_score * 0.08) +
        (social_interaction_score * 0.07)
    )

    # 時間衰減係數
    time_decay_factor = 0.96**days_since_last_active

    # 最終個人活躍度分數
    final_personal_activity_score = base_activity_score * time_decay_factor

    return final_personal_activity_score

# Create a DataFrame for the spreadsheet
data = {
    '參數': [
        '近7天登入天數 (天)', '近7天總在線時長 (分鐘)',
        '近7天遊戲場次 (場)', '週總押注 (遊戲幣)', '個人公會基金貢獻 (遊戲幣)', '個人總押注 (遊戲幣)', '個人總獲勝金額 (遊戲幣)',
        '週儲值 (新台幣)',
        '近7天完成任務數 (個)', '近7天可接取任務數 (個)', '任務品質分數 (0-100)',
        '近7天活動平均完成度 (0-100)', '本週是否有活動 (True/False)',
        '近7天有效公共頻道發言次數 (次)', '近7天有效私聊對話次數 (次)', '近7天有效公會頻道發言次數 (次)',
        '距離上次活躍天數 (天)'
    ],
    '預設值': [
        7, 120 * 7, # 登入頻率, 在線時長
        100, 5000, 100, 10000, 5000, # 遊戲貢獻
        500, # 儲值貢獻
        5, 5, 80, # 任務完成
        80, True, # 活動參與
        10, 5, 10, # 社交互動
        0 # 時間衰減
    ],
    '說明': [
        '近7天內登入遊戲的天數 (0-7)', '近7天內在線的總分鐘數',
        '近7天內參與遊戲的總場次', '近7天內總押注的遊戲幣金額', '近7天內個人貢獻給公會基金的遊戲幣金額', '近7天內個人總押注的遊戲幣金額', '近7天內個人總獲勝的遊戲幣金額',
        '近7天內儲值的總新台幣金額',
        '近7天內完成的任務數量', '近7天內可接取的任務數量', '任務完成的品質分數 (0-100)',
        '近7天內所有參與活動的平均完成度 (0-100)', '本週是否有舉辦活動，若無則活動參與度分數為60',
        '近7天內在公共頻道有效發言的次數', '近7天內有效私聊對話的次數', '近7天內在公會頻道有效發言的次數',
        '距離上次有任何活躍行為的天數'
    ]
}

df = pd.DataFrame(data)

# Add a column for calculated score (initially using default values)
def calculate_row_score(row):
    return calculate_personal_activity_score(
        row['預設值'][0], row['預設值'][1],
        row['預設值'][2], row['預設值'][3], row['預設值'][4], row['預設值'][5], row['預設值'][6],
        row['預設值'][7],
        row['預設值'][8], row['預設值'][9], row['預設值'][10],
        row['預設值'][11], row['預設值'][12],
        row['預設值'][13], row['預設值'][14], row['預設值'][15],
        row['預設值'][16]
    )

# Placeholder for the actual calculation logic, will be updated later
# For now, just return a dummy score
df['計算結果'] = ''

# Save to Excel
df.to_excel('personal_activity_spreadsheet.xlsx', index=False)

print('personal_activity_spreadsheet.xlsx created successfully.')


