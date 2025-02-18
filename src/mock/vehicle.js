import Mock from 'mockjs'

Mock.mock('/api/vehicle/statistics', 'get', {
  'todayEnter': '@integer(100, 200)',
  'currentInSchool': '@integer(50, 100)',
  'abnormal': '@integer(0, 5)'
})

Mock.mock('/api/vehicle/records', 'get', {
  'data|10': [{
    'id|+1': 1,
    'plateNumber': '@pick(["京A","京B","京C"])@string("upper", 5)',
    'action': '@pick(["进入校园","离开校园","尝试进入"])',
    'status': '@pick(["正常","异常"])',
    'time': '@datetime("yyyy-MM-dd HH:mm:ss")'
  }]
})

Mock.mock(/\/api\/vehicle\/info\/.*/, 'get', {
  'plateNumber': '@pick(["京A","京B","京C"])@string("upper", 5)',
  'type': '@pick(["小型轿车","SUV","面包车"])',
  'color': '@pick(["黑色","白色","银色","红色"])',
  'enterTime': '@datetime("yyyy-MM-dd HH:mm:ss")',
  'department': '@pick(["教务处","学生处","后勤处","保卫处"])',
  'status': '@pick(["正常","异常"])'
}) 