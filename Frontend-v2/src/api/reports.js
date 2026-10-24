import client from './client'

export const getSummaryReport = () => client.get('/reports/summary')
