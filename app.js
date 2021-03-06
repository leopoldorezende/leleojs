// Global and reactive variables
var data = {
    appTitle: 'Nova Tarefa',
    title: 'Nova Tarefa',
    titleColor: '#688',
    list: ['Finalizar leleojs', 'Estudar mais', 'Ter Juízo'],
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
                marginBottom: '0px',
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
                text: 'Lista de Tarefas',
                prefix: '', 
                size: 2,
            })
        },
        newtask: {
            _prop: {
                tag: 'div',
                style: {
                    width: '50%',
                    float: 'left',
                    boxSizing: 'border-box',
                    children: {
                        '::after': {
                            display: 'block',
                            marginTop: '20px',
                            textTransform: 'capitalize',
                            content: '`Seja Criativo!`',
                        },
                    },
                },
            },
            subTitle: {
                _prop: components.title({
                    text: data.title,
                    prefix: 'Adicionando: ', 
                    size: 1,
                })
            },
            inputTaskName: {
                _prop: {
                    tag: 'input',
                    attributes: {
                        placeholder: 'Título',
                        dataActive: data.title,
                    },
                    style: {
                        width: 'calc(100% - 130px)',
                        marginTop: '13px',
                        padding: '8px',
                        color: '#fff',
                        background: '#2a2d31',
                        border: '1px solid #444',
                        fontFamily: 'Monaco',
                        outline: 'none',
                        boxSizing: 'border-box',
                    },
                    events: {
                        input: function(el, data) {
                            if(el.value == '') {
                                data.title = data.appTitle
                                data.titleColor = '#688' 
                            }
                            else { 
                                data.title = el.value
                                data.titleColor = '#fe8'
                            }
                            app.newtask.buttonCreateTask._prop.actions()
                            app.newtask.subTitle._prop.actions()
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
                        padding: '9px',
                        color: '#555',
                        fontWeight: 'bold',
                        border: 0,
                        font: 'bold 12px Monaco',
                        textAlign: 'center',
                        outline: 0,
                        cursor: 'pointer',
                        children: {
                            ':hover': {
                                background: '#f6ac57',
                                color: 'black',
                            },
                            ':disabled': {
                                background: '#888',
                                color: '#555',
                                cursor: 'default',
                            },
                        },
                    },
                    attributes: {
                        disabled: true
                    },
                    events: {
                        click: function(el, data) {
                            data.list.push(data.title)
                            data.list = Array.from(data.list)
                            data.title = data.appTitle
                            data.titleColor = '#688'
                            
                            app.newtask.subTitle._prop.actions()
                            app.newtask.buttonCreateTask._prop.actions()
                        },
                    },
                    actions: function () {
                        if(data.appTitle != data.title) {
                            this.content = 'Adicionar'
                            delete this.attributes.disabled
                        }
                        else {
                            this.content = 'Escreva'
                            this.attributes.disabled = true
                        }
                    },
                },
            },
        },
        taskview: {
            _prop: {
                tag: 'div',
                style: {
                    width: '50%',
                    float: 'left',
                    boxSizing: 'border-box',
                },
            },
            titleList: {
                _prop: {
                    tag: 'h2',
                    content: 'Lista de Tarefas',
                    style: {
                        margin: 0,
                        padding: 0,
                        fontSize: '14px'
                    },
                }
            },
            ulList: {
                _prop: {
                    tag: 'ul',
                    style: {
                        padding: 0,
                        margin: '20px, 0, 0, 0',
                    }
                },
                liItems: {
                    _prop: {
                        tag: 'li',
                        content: data.list,
                        style: {
                            width: '100%',
                            padding: '8px 12px',
                            borderBottom: '1px solid #444',
                            background: '#2a2d31',
                            color: 'white',
                            listStyle: 'none',
                            fontSize: '13px',
                            transition: 'all .3s',
                            boxSizing: 'border-box',
                            children: {
                                ':hover': {
                                    background: '#3f4751'
                                }
                            },
                        },
                    },
                    removeButton: {
                        _prop: {
                            tag: 'button',
                            content: '×',
                            style: {
                                float: 'right',
                                width: '20px',
                                height: '20px',
                                padding: 0,
                                border: 0,
                                background: 'transparent',
                                color: '#fff',
                                fontSize: '20px',
                                lineHeight: '8px',
                                cursor: 'pointer',
                                children: {
                                    ':hover': {
                                        color: '#f50',
                                    },
                                    ':focus': {
                                        outline: 0,
                                    },
                                }
                            },
                            events: {
                                click: function(el, data) {
                                    data.list.splice(el.getAttribute('data-index'), 1)
                                    data.list = Array.from(data.list)
                                }
                            },
                        },
                    },
                },
            },
            liNoItems: {
                _prop: (() => {
                    var visible
                    if(data.list.length > 0) visible = 'none'
                    else visible = 'block'
                    
                    return {
                        tag: 'p',
                        content: 'Não há itens cadastrados',
                        style: {
                            display: visible,
                            width: '100%',
                            padding: '8px 12px',
                            borderBottom: '1px solid #444',
                            background: '#2a2d31',
                            color: '#888',
                            listStyle: 'none',
                            fontSize: '13px',
                            transition: 'all .3s',
                            boxSizing: 'border-box',
                        },
                    }
                })(),
            },
        },
        copyleft: {
            _prop: {
                content: 'leleoJS - <i>Copyleft 2020</i>',
                style: {
                    position: 'fixed',
                    width: '100%',
                    bottom: '20px',
                    fontSize: '12px',
                    paddingTop: '20px',
                    clear: 'both',
                }
            }
        },
    }
}

// Subsequent actions
function complete() {
    app.newtask.subTitle._prop.actions()
}
