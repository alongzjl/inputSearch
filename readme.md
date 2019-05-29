 数据结构
selectMap:{
                showLocal:{
                    deleteOnly:true, //每一条数据是否显示删除按钮
                    showNumber:5    //显示的缓存的数量  默认数量  5
                },  //  未设置或false  不显示  true  默认
                //defaultMapShow:false,  //搜索框中是否显示初始默认的值  
                // defaultMap:{  //  初始默认值配置 obj 
                //     "位置":'河南',
                //     build:'along'
                // },
                selectProps:{
                    showSearch:true
                },
                defaultInput:'age', // 默认的input框中的查询value
                dataMap:[{
                    value:'xingming',
                    title:'姓名',
                    type:'input'
                },{
                    value:'start',
                    title:'日期',
                    type:'date',
                    props:{}
                },{
                    value:'range',
                    title:'始末时间',
                    type:'dateRange',
                    props:{}
                },{
                    value:'showShps',
                    title:'显示商品',
                    type:'radio',
                    props:{},
                    list:[{
                        value:true,
                        title:'是'
                    },{
                        value:false,
                        title:'否'
                    }]
                },{
                    value:'hide',
                    title:'多选',
                    type:'selectMany',
                    props:{},
                    list:[{
                            value:'list1',
                            title:'list123'
                        },{
                            value:'list2',
                            title:'list211'
                        },{
                            value:'list3',
                            title:'list311'
                        }]
                },{
                    value:'country',
                    title:'地区',
                    type:'selectTree',
                    props:{
                        treeCheckable:false,
                        multiple:true,
                        showSearch:false
                    },
                    list:[
                            {
                            title: 'Node1',
                            value: '0-0',
                            key: '0-0',
                            children: [
                                {
                                title: 'Child Node1',
                                value: '0-0-0',
                                key: '0-0-0',
                                },
                            ],
                            },
                            {
                            title: 'Node2',
                            value: '0-1',
                            key: '0-1',
                            children: [
                                {
                                title: 'Child Node3',
                                value: '0-1-0',
                                key: '0-1-0',
                                },
                                {
                                title: 'Child Node4',
                                value: '0-1-1',
                                key: '0-1-1',
                                },
                                {
                                title: 'Child Node5',
                                value: '0-1-2',
                                key: '0-1-2',
                                },
                            ],
                            },
                        ]
                 },{
                    value:'asd',
                    title:'发生的',
                    type:'selectOne',
                    props:{},
                    list:[{
                        value:'list1',
                        title:'list123'
                    },{
                        value:'list2',
                        title:'list211'
                    },{
                        value:'list3',
                        title:'list311'
                    }]
                },{
                    value:'along',
                    title:'阿龙',
                    type:'selectOne',
                    props:{
                        showSearch:false
                    },
                    list:[{
                        value:'list1',
                        title:'list111'
                    },{
                        value:'list2',
                        title:'list222'
                    },{
                        value:'list3',
                        title:'list333'
                    }]
                },{
                    value:'fdfds',
                    title:'萨芬',
                    type:'selectOne',
                    props:{},
                    list:[{
                        value:'list1',
                        title:'list11'
                    },{
                        value:'list2',
                        title:'list22',
                    },{
                        value:'list3',
                        title:'list33'
                    }]
                }],
            },
            buttonStatus : {
                to_enabled:true,
                to_disabled:true,
                todo:true,
                trash:true,
                refresh:true
              }
