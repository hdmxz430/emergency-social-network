//vaildate groups
let dbGroups = [{
    initialUser: 'zeqiang',
    groupName: 'zeqiang,junbo,zeyu,haotang',
    members: ['zeqiang', 'junbo', 'zeyu', 'haotang']
}, {
    initialUser: 'sunzeyu',
    groupName: 'sunzeyu,junbo1,zeqiang,haotang',
    members: ['sunzeyu', 'junbo1', 'zeqiang', 'haotang']
}];

// groups that not satisfied the requirement
let newGroups = [{
    initialUser: 'asda', // user is not in database
    groupName: 'asda,junbo,zeyu,haotang',
    members: ['asda', 'junbo', 'zeyu', 'haotang']
}, {
    initialUser: 'zhuzeyu', // do not have members
    groupName: 'zhuzeyu, junbo, zeyu, haotang'
}, {
    initialUser: 'zhuzeyu', // members size is not vaild
    groupName: 'zhuzeyu, junbo, zeyu, haotang',
    members: []
}, {
    initialUser: 'zhuzeyu', // members size is exceed the max limitation
    groupName: 'zhuzeyu, junbo, zeyu, haotang',
    members: ['zhuzeyu', 'junbo', 'zeyu', 'haotang', 'someone1', 'someone2']
}, {
    initialUser: 'zhuzeyu', // initial user does not match with first member
    groupName: 'zhuzeyu, junbo, zeyu, haotang',
    members: ['junbo', 'zhuzeyu', 'zeyu', 'haotang']
}];

module.exports = {dbGroups, newGroups};