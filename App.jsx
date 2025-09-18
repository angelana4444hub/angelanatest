import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Calculator, TrendingUp, Users, Gamepad2, CreditCard, CheckSquare, Calendar, MessageCircle } from 'lucide-react'
import './App.css'

function App() {
  // 狀態管理
  const [inputs, setInputs] = useState({
    loginDays: 7,
    totalOnlineMinutes: 840, // 7 days * 120 minutes
    gameSessions: 100,
    weeklyTotalBet: 5000,
    guildFundContribution: 100,
    personalTotalBet: 10000,
    personalTotalWin: 5000,
    weeklyRecharge: 500,
    tasksCompleted: 5,
    tasksAvailable: 5,
    taskQualityScore: 80,
    activityCompletionAvg: 80,
    hasActivityThisWeek: true,
    publicChatCount: 10,
    privateChatCount: 5,
    guildChatCount: 10,
    daysSinceLastActive: 0
  })

  const [results, setResults] = useState({
    basicParticipation: 0,
    gameContribution: 0,
    rechargeContribution: 0,
    taskCompletion: 0,
    activityParticipation: 0,
    socialInteraction: 0,
    baseScore: 0,
    finalScore: 0,
    level: ''
  })

  // 計算個人活躍值
  const calculateActivityScore = () => {
    // 1. 基礎參與度分數 (權重15%)
    const loginFrequencyScore = (inputs.loginDays / 7) * 100
    const avgDailyOnlineMinutes = inputs.loginDays > 0 ? inputs.totalOnlineMinutes / inputs.loginDays : 0
    const onlineDurationScore = Math.min(avgDailyOnlineMinutes / 120 * 100, 100)
    const basicParticipationScore = (loginFrequencyScore * 0.6) + (onlineDurationScore * 0.4)

    // 2. 遊戲貢獻度分數 (權重40%)
    const gameParticipationScore = Math.min(inputs.gameSessions / 100 * 100, 100)
    
    // 簡化的對數公式
    const betContributionScore = Math.min(Math.log10(Math.max(inputs.weeklyTotalBet, 35) / 5000) * 25 + 60, 100)
    
    // 公會基金貢獻分數
    let guildFundScore = 0
    if (inputs.guildFundContribution >= 100) guildFundScore = 85
    else if (inputs.guildFundContribution >= 50) guildFundScore = 70
    else if (inputs.guildFundContribution >= 20) guildFundScore = 50
    else if (inputs.guildFundContribution >= 1) guildFundScore = 30
    else guildFundScore = 0
    guildFundScore = Math.min(guildFundScore + Math.floor(inputs.guildFundContribution / 10) * 2, 100)

    // 平台收益貢獻分數
    const platformContribution = inputs.personalTotalBet - inputs.personalTotalWin
    const platformContributionRate = inputs.personalTotalBet > 0 ? (platformContribution / inputs.personalTotalBet) * 100 : 0
    
    let platformRevenueScore = 0
    if (inputs.personalTotalBet > 0) {
      if (platformContributionRate > 25) platformRevenueScore = 100
      else if (platformContributionRate >= 15) platformRevenueScore = 80
      else if (platformContributionRate >= 5) platformRevenueScore = 60
      else if (platformContributionRate >= -5) platformRevenueScore = 40
      else platformRevenueScore = 20
    }

    const gameContributionScore = (
      (gameParticipationScore * 0.2) +
      (betContributionScore * 0.3) +
      (guildFundScore * 0.25) +
      (platformRevenueScore * 0.25)
    )

    // 3. 儲值貢獻度分數 (權重20%)
    const rechargeScore = Math.min(Math.log10(Math.max(inputs.weeklyRecharge, 30) / 500) * 35 + 65, 100)

    // 4. 任務完成度分數 (權重10%)
    const taskCompletionRatio = inputs.tasksAvailable > 0 ? inputs.tasksCompleted / inputs.tasksAvailable : 0
    const taskCompletionRatioScore = taskCompletionRatio * 100
    const taskCompletionScore = (taskCompletionRatioScore * 0.7) + (inputs.taskQualityScore * 0.3)

    // 5. 活動參與度分數 (權重8%)
    const activityParticipationScore = inputs.hasActivityThisWeek ? inputs.activityCompletionAvg : 60

    // 6. 社交互動度分數 (權重7%)
    const publicChatScore = Math.min(inputs.publicChatCount * 2, 40)
    const privateChatScore = Math.min(inputs.privateChatCount * 3, 30)
    const guildChatScore = Math.min(inputs.guildChatCount * 4, 60)
    const socialInteractionScore = (
      (publicChatScore * 0.4) +
      (privateChatScore * 0.3) +
      (guildChatScore * 0.3)
    )

    // 基礎活躍度分數
    const baseActivityScore = (
      (basicParticipationScore * 0.15) +
      (gameContributionScore * 0.40) +
      (rechargeScore * 0.20) +
      (taskCompletionScore * 0.10) +
      (activityParticipationScore * 0.08) +
      (socialInteractionScore * 0.07)
    )

    // 時間衰減係數
    const timeDecayFactor = Math.pow(0.96, inputs.daysSinceLastActive)

    // 最終個人活躍度分數
    const finalPersonalActivityScore = baseActivityScore * timeDecayFactor

    // 等級劃分
    let level = ''
    if (finalPersonalActivityScore >= 90) level = 'SS級 - 超級活躍玩家'
    else if (finalPersonalActivityScore >= 80) level = 'S級 - 高度活躍玩家'
    else if (finalPersonalActivityScore >= 65) level = 'A級 - 活躍玩家'
    else if (finalPersonalActivityScore >= 50) level = 'B級 - 中等活躍玩家'
    else if (finalPersonalActivityScore >= 35) level = 'C級 - 較低活躍玩家'
    else level = 'D級 - 不活躍玩家'

    setResults({
      basicParticipation: basicParticipationScore,
      gameContribution: gameContributionScore,
      rechargeContribution: rechargeScore,
      taskCompletion: taskCompletionScore,
      activityParticipation: activityParticipationScore,
      socialInteraction: socialInteractionScore,
      baseScore: baseActivityScore,
      finalScore: finalPersonalActivityScore,
      level: level
    })
  }

  // 處理輸入變更
  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 自動計算
  useEffect(() => {
    calculateActivityScore()
  }, [inputs])

  // 重置為預設值
  const resetToDefaults = () => {
    setInputs({
      loginDays: 7,
      totalOnlineMinutes: 840,
      gameSessions: 100,
      weeklyTotalBet: 5000,
      guildFundContribution: 100,
      personalTotalBet: 10000,
      personalTotalWin: 5000,
      weeklyRecharge: 500,
      tasksCompleted: 5,
      tasksAvailable: 5,
      taskQualityScore: 80,
      activityCompletionAvg: 80,
      hasActivityThisWeek: true,
      publicChatCount: 10,
      privateChatCount: 5,
      guildChatCount: 10,
      daysSinceLastActive: 0
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 標題 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <Calculator className="h-8 w-8 text-blue-600" />
            個人活躍值計算器
          </h1>
          <p className="text-gray-600">基於公會活躍值計算系統 v10.0</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側：輸入參數 */}
          <div className="space-y-6">
            {/* 基礎參與度 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  基礎參與度 (權重15%)
                </CardTitle>
                <CardDescription>登入頻率和在線時長</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="loginDays">近7天登入天數 (0-7天)</Label>
                  <Input
                    id="loginDays"
                    type="number"
                    min="0"
                    max="7"
                    value={inputs.loginDays}
                    onChange={(e) => handleInputChange('loginDays', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="totalOnlineMinutes">近7天總在線時長 (分鐘)</Label>
                  <Input
                    id="totalOnlineMinutes"
                    type="number"
                    min="0"
                    value={inputs.totalOnlineMinutes}
                    onChange={(e) => handleInputChange('totalOnlineMinutes', parseInt(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 遊戲貢獻度 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-purple-600" />
                  遊戲貢獻度 (權重40%)
                </CardTitle>
                <CardDescription>遊戲參與和押注行為</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="gameSessions">近7天遊戲場次</Label>
                  <Input
                    id="gameSessions"
                    type="number"
                    min="0"
                    value={inputs.gameSessions}
                    onChange={(e) => handleInputChange('gameSessions', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="weeklyTotalBet">週總押注 (遊戲幣)</Label>
                  <Input
                    id="weeklyTotalBet"
                    type="number"
                    min="0"
                    value={inputs.weeklyTotalBet}
                    onChange={(e) => handleInputChange('weeklyTotalBet', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="guildFundContribution">個人公會基金貢獻 (遊戲幣)</Label>
                  <Input
                    id="guildFundContribution"
                    type="number"
                    min="0"
                    value={inputs.guildFundContribution}
                    onChange={(e) => handleInputChange('guildFundContribution', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="personalTotalBet">個人總押注 (遊戲幣)</Label>
                  <Input
                    id="personalTotalBet"
                    type="number"
                    min="0"
                    value={inputs.personalTotalBet}
                    onChange={(e) => handleInputChange('personalTotalBet', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="personalTotalWin">個人總獲勝金額 (遊戲幣)</Label>
                  <Input
                    id="personalTotalWin"
                    type="number"
                    min="0"
                    value={inputs.personalTotalWin}
                    onChange={(e) => handleInputChange('personalTotalWin', parseInt(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 儲值貢獻度 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                  儲值貢獻度 (權重20%)
                </CardTitle>
                <CardDescription>平台收益來源</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="weeklyRecharge">週儲值 (新台幣)</Label>
                  <Input
                    id="weeklyRecharge"
                    type="number"
                    min="0"
                    value={inputs.weeklyRecharge}
                    onChange={(e) => handleInputChange('weeklyRecharge', parseInt(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 任務完成度 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-red-600" />
                  任務完成度 (權重10%)
                </CardTitle>
                <CardDescription>日常參與表現</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tasksCompleted">近7天完成任務數</Label>
                  <Input
                    id="tasksCompleted"
                    type="number"
                    min="0"
                    value={inputs.tasksCompleted}
                    onChange={(e) => handleInputChange('tasksCompleted', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="tasksAvailable">近7天可接取任務數</Label>
                  <Input
                    id="tasksAvailable"
                    type="number"
                    min="1"
                    value={inputs.tasksAvailable}
                    onChange={(e) => handleInputChange('tasksAvailable', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <Label htmlFor="taskQualityScore">任務品質分數 (0-100)</Label>
                  <Input
                    id="taskQualityScore"
                    type="number"
                    min="0"
                    max="100"
                    value={inputs.taskQualityScore}
                    onChange={(e) => handleInputChange('taskQualityScore', parseInt(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 活動參與度 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-teal-600" />
                  活動參與度 (權重8%)
                </CardTitle>
                <CardDescription>特殊事件投入</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="activityCompletionAvg">近7天活動平均完成度 (0-100)</Label>
                  <Input
                    id="activityCompletionAvg"
                    type="number"
                    min="0"
                    max="100"
                    value={inputs.activityCompletionAvg}
                    onChange={(e) => handleInputChange('activityCompletionAvg', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="hasActivityThisWeek"
                    type="checkbox"
                    checked={inputs.hasActivityThisWeek}
                    onChange={(e) => handleInputChange('hasActivityThisWeek', e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="hasActivityThisWeek">本週有舉辦活動</Label>
                </div>
              </CardContent>
            </Card>

            {/* 社交互動度 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-pink-600" />
                  社交互動度 (權重7%)
                </CardTitle>
                <CardDescription>公會凝聚力建設</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="publicChatCount">近7天有效公共頻道發言次數</Label>
                  <Input
                    id="publicChatCount"
                    type="number"
                    min="0"
                    value={inputs.publicChatCount}
                    onChange={(e) => handleInputChange('publicChatCount', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="privateChatCount">近7天有效私聊對話次數</Label>
                  <Input
                    id="privateChatCount"
                    type="number"
                    min="0"
                    value={inputs.privateChatCount}
                    onChange={(e) => handleInputChange('privateChatCount', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="guildChatCount">近7天有效公會頻道發言次數</Label>
                  <Input
                    id="guildChatCount"
                    type="number"
                    min="0"
                    value={inputs.guildChatCount}
                    onChange={(e) => handleInputChange('guildChatCount', parseInt(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 時間衰減 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-gray-600" />
                  時間衰減機制
                </CardTitle>
                <CardDescription>活躍度隨時間衰減</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="daysSinceLastActive">距離上次活躍天數</Label>
                  <Input
                    id="daysSinceLastActive"
                    type="number"
                    min="0"
                    value={inputs.daysSinceLastActive}
                    onChange={(e) => handleInputChange('daysSinceLastActive', parseInt(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 重置按鈕 */}
            <Button onClick={resetToDefaults} variant="outline" className="w-full">
              重置為預設值
            </Button>
          </div>

          {/* 右側：計算結果 */}
          <div className="space-y-6">
            {/* 最終分數 */}
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-center text-2xl">最終活躍度分數</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-6xl font-bold text-blue-600 mb-4">
                  {results.finalScore.toFixed(1)}
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {results.level}
                </Badge>
                <Separator className="my-4" />
                <div className="text-sm text-gray-600">
                  基礎分數: {results.baseScore.toFixed(1)} × 時間衰減係數: {Math.pow(0.96, inputs.daysSinceLastActive).toFixed(3)}
                </div>
              </CardContent>
            </Card>

            {/* 各維度分數 */}
            <Card>
              <CardHeader>
                <CardTitle>各維度分數詳情</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    基礎參與度 (15%)
                  </span>
                  <Badge variant="outline">{results.basicParticipation.toFixed(1)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Gamepad2 className="h-4 w-4 text-purple-600" />
                    遊戲貢獻度 (40%)
                  </span>
                  <Badge variant="outline">{results.gameContribution.toFixed(1)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-orange-600" />
                    儲值貢獻度 (20%)
                  </span>
                  <Badge variant="outline">{results.rechargeContribution.toFixed(1)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-red-600" />
                    任務完成度 (10%)
                  </span>
                  <Badge variant="outline">{results.taskCompletion.toFixed(1)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-teal-600" />
                    活動參與度 (8%)
                  </span>
                  <Badge variant="outline">{results.activityParticipation.toFixed(1)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-pink-600" />
                    社交互動度 (7%)
                  </span>
                  <Badge variant="outline">{results.socialInteraction.toFixed(1)}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* 等級說明 */}
            <Card>
              <CardHeader>
                <CardTitle>活躍度等級說明</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>SS級 (90-100分)</span>
                  <span className="text-purple-600 font-semibold">超級活躍玩家</span>
                </div>
                <div className="flex justify-between">
                  <span>S級 (80-89分)</span>
                  <span className="text-blue-600 font-semibold">高度活躍玩家</span>
                </div>
                <div className="flex justify-between">
                  <span>A級 (65-79分)</span>
                  <span className="text-green-600 font-semibold">活躍玩家</span>
                </div>
                <div className="flex justify-between">
                  <span>B級 (50-64分)</span>
                  <span className="text-yellow-600 font-semibold">中等活躍玩家</span>
                </div>
                <div className="flex justify-between">
                  <span>C級 (35-49分)</span>
                  <span className="text-orange-600 font-semibold">較低活躍玩家</span>
                </div>
                <div className="flex justify-between">
                  <span>D級 (0-34分)</span>
                  <span className="text-red-600 font-semibold">不活躍玩家</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

