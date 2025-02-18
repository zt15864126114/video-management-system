import Mock from 'mockjs'

Mock.mock('/api/access/doors', 'get', {
  'data|3-5': [{
    'id|+1': 1,
    'name': '@pick(["正门","侧门","后门","东门","西门"])',
    'status': '@pick(["locked", "unlocked"])',
    'todayPass': '@integer(50, 500)',
    'abnormal': '@integer(0, 5)'
  }]
})

Mock.mock('/api/access/records', 'get', {
  'data|20': [{
    'id|+1': 1,
    'time': '@datetime("yyyy-MM-dd HH:mm:ss")',
    'name': '@cname',
    'doorName': '@pick(["正门","侧门","后门","东门","西门"])',
    'status': '@pick(["正常", "异常"])'
  }]
})

Mock.mock('/api/access/control', 'post', {
  'code': 200,
  'message': '操作成功',
  'data': {
    'status': '@pick(["locked", "unlocked"])'
  }
}) 