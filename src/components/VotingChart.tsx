import React from 'react'

type VotingChartProps = {
  data: Array<unknown>
}

const VotingChart: React.FC<VotingChartProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc' }}>
      <span>VotingChart placeholder (items: {Array.isArray(data) ? data.length : 0})</span>
    </div>
  )
}

export default VotingChart


