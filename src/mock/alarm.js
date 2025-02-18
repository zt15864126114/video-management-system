import Mock from 'mockjs'

Mock.mock('/api/alarm/statistics', 'get', {
  'todayAlarms': '@integer(0, 10)',
  'todayChange': '@integer(-30, 30)',
  'processing': '@integer(0, 5)',
  'processed': '@integer(0, 10)'
})

Mock.mock(/\/api\/alarm\/records.*/, 'get', {
  'data|5-10': [{
    'id|+1': 1,
    'type': '@pick(["入侵报警", "火灾报警", "求助报警"])',
    'location': '@pick(["正门", "后门", "教学楼", "操场", "宿舍楼"])',
    'time': '@datetime("yyyy-MM-dd HH:mm:ss")',
    'description': '@csentence(10, 20)',
    'status': '@pick(["processing", "processed"])'
  }]
})

Mock.mock(/\/api\/alarm\/process\/.*/, 'post', {
  'code': 200,
  'message': '处理成功'
})

Mock.mock('/api/alarm/emergency', 'post', {
  'code': 200,
  'message': '紧急报警已发起'
})

Mock.mock('/api/alarm/broadcast', 'post', {
  'code': 200,
  'message': '广播发送成功'
}) 