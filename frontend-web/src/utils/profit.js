const FEE_RATE = 0.13

export const calcMid = (low, high) => Math.round((low + high) / 2)
export const calcFees = (mid) => Math.round(mid * FEE_RATE * 100) / 100
export const calcProfit = (mid, buyPrice, fees) => Math.round((mid - (buyPrice || 0) - fees) * 100) / 100
export const calcROI = (profit, buyPrice) => !buyPrice ? null : Math.round((profit / buyPrice) * 100)

export const calcAll = ({ low, high, buyPrice }) => {
  const mid = calcMid(low, high)
  const fees = calcFees(mid)
  const profit = calcProfit(mid, buyPrice, fees)
  const roi = calcROI(profit, buyPrice)
  return { mid, fees, profit, roi }
}

export const fmt = (val) => {
  if (val === null || val === undefined) return '—'
  return (val < 0 ? '-' : '') + '$' + Math.abs(Math.round(val)).toLocaleString()
}

export const sentiment = (profit, buyPrice) => {
  if (!buyPrice) return 'neutral'
  const roi = calcROI(profit, buyPrice)
  if (roi >= 30) return 'good'
  if (roi > 0) return 'ok'
  return 'bad'
}
