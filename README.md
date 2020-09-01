# leleojs

If you're thinking "Oh shit, one more framework". Be calm, this is just a laboratory to show that you don't need a big code for vanilla to gain other flavors, including reactivity.

*Se você está pensando "Ah não, mais uma framework". Fique tranquilo, este é apenas um laboratório para mostrar que não é necessário muito código para o JS Baunilha ganhar outros sabores, inclusive o da reatividade.*

#### Simple example of a "task list":
```sh
// Global and reactive variables
var data = {
    title: 'New Task',
    titleColor: '#688',
    list: ['Finalizar leleojs', 'Estudar mais', 'Ter Juízo'],
    complete: function() {
        
    }
}

// Reusable components
const components = {
    title: (params) => {
        return {
            tag: 'h1',
            content: params.text,
            style: {
                color: data.titleColor,
                fontSize: params.size+'em',
            },
            actions: function () {
                this.content = params.prefix+params.text
            },
        }
    },
}

// Building by objects
const setApp = (data) => {
    return {
        title: {
            _prop: components.title({
                text: "My Tasks",
                size: 2,
            }),
        },
        subtitle: {
            _prop: components.title({
                text: data.title,
                prefix: 'Add: ', 
                size: 1,
            }),
        },
        newtask: {
            _prop: {
                tag: 'div',
                style: {
                    width: '50%',
                    float: 'left',
                    boxSizing: 'border-box',
                },
            },
            inputTaskName: {
                _prop: {
                    tag: 'input',
                    attributes: {
                        placeholder: 'Título',
                    },
                    events: {
                        input: function(el, data) {
                            if(el.value == '') {
                                data.title = 'New Task'
                                data.titleColor = '#688' 
                            }
                            else { 
                                data.title = el.value
                                data.titleColor = '#7e9'
                            }
                            app.subtitle._prop.actions()
                        },
                    },
                },
            },
            buttonCreateTask: {
                _prop: {
                    tag: 'button',
                    content: 'Escreva',
                    style: {
                        width: '90px',
                        color: '#555',
                        children: {
                            ':hover': {
                                background: '#7e9',
                            },
                        },
                    },
                    events: {
                        click: function(el, data) {
                            if(app.newtask.inputTaskName._prop._element.value != '') {
                                data.list.push(data.title)
                                data.list = Array.from(data.list)
                                data.title = "New Task"
                                data.titleColor = '#688'
                            }
                        },
                    },
                },
            },
        },
        ulList: {
            _prop: {
                tag: 'ul',
                style: {
                    width: '40%',
                    float: 'left',
                    boxSizing: 'border-box',
                },
            },
            liItems: {
                _prop: {
                    tag: 'li',
                    content: data.list,
                    style: {
                        height: '30px',
                    },
                },
                removeButton: {
                    _prop: {
                        tag: 'button',
                        content: '×',
                        style: {
                            float: 'right',
                        },
                        events: {
                            click: function(el, data) {
                                data.list.splice(el.getAttribute('data-index'), 1)
                                data.list = Array.from(data.list)
                            },
                        },
                    },
                },
            },
        },
    }
}

// Subsequent actions
function complete() {
    app.subtitle._prop.actions()
}
```
