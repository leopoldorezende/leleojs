
// leleo.js
// Só na manha

var app = setApp(data)

const applyProxy = (objToWatch, onChangeFunction) => { 
    const handler = {
        set(target, property, value) {
            return (function() {
                Reflect.set(target, property, value)
                onChangeFunction();
            })()
        }
    }
    return new Proxy(objToWatch, handler)
}
var data = applyProxy(data, function() {
    var newApp = setApp(data)

    var mergeApp = function(obj, objNewRaw) {
        Object.keys(obj).forEach(function(el) {
            if(el != '_prop') {
                var objNew = {}
                if(objNewRaw) objNew = objNewRaw[el]
                else objNew = newApp[el]
                
                if(objNew) {
                    Object.keys(obj[el]._prop).forEach(function(target) {

                        if(target != 'tag' && target != '_element') {
                            var old = obj[el]._prop[target]
                            var current = objNew._prop[target]

                            switch(target) {
                                case 'content':
                                    if(old != current) {
                                        obj[el]._prop[target] = current
                                    }
                                    break
                                case 'style':
                                    Object.keys(old).forEach(function(key) {
                                        if(old[key] != current[key] && key != 'children') {
                                            old[key] = current[key]
                                        }
                                    })
                                    break
                                case 'attributes':
                                    Object.keys(old).forEach(function(key) {
                                        if(old[key] != current[key]) old[key] = current[key]
                                    })
                                    break
                                default:
                                    obj[el]._prop[target] = current
                                    break
                            }
                        }
                    })

                    if(Object.keys(obj).length > 1) {
                        mergeApp(obj[el], objNew)
                    }
                }
            }
        })
    }
    mergeApp(app)
})

// --------------------------------------------------- Leopoldo Tools

// Criando atalho para seletores e funções
const $ = document.querySelector.bind(document)
const createElement = document.createElement.bind(document)

// Convertendo nomes de camelCase para kebab-case
function camelToKebab(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

// Criando sintaxe mais simples para adição de atributos
Element.prototype.attr = function(options) {
    const el = this
    Object.keys(options).forEach(function(attr) {
        el.setAttribute(camelToKebab(attr), options[attr])
    })
    return this
}

// Criando sintaxe mais simples para adição de estilos
Element.prototype.css = function(options, reset) {
    var css = (this.getAttribute('style') && !reset) ? this.getAttribute('style') : ''
    Object.keys(options).forEach(function(attr) {
        if(css.lastIndexOf(attr) > -1) {
            // Reescrevenndo valores de atributos existentes
            var strStart = css.indexOf(attr)
            var term = css.slice(strStart, css.substring(strStart, css.length).indexOf(';')+strStart+1)
            if(term != '') css = css.replace(term,'')
        }
        css += `${camelToKebab(attr)}:${options[attr]};`
    })
    this.setAttribute('style', css)
    return this
}

// Adicionando Proxy
onChange = function(el) { 
    const handler = {
        set(target, key, value) {
            if(key != 'tag' && key != '_element') {
                el.fnSet(el.proxyParent, key, value)
                return Reflect.set(target, key, value)
            }
            else {
                console.warn(`Não é permitido mudar o valor de ${key}`)
            }
        },
        deleteProperty(target, key) {
            return (function() {
                if(!target.tag) {
                    Reflect.deleteProperty(target, key)
                    el.fnDelete(el.proxyParent, key)
                }
                else {
                    console.warn('Não é permitido deletar objetos de props')
                }
            })()     
        }
    }
    return new Proxy(el.proxyObject, handler)
}    

// Render
var styleSheet = {}
var listNumber = 0

function render(container, comp, refParent, refChild) {
    
    // Função recursiva que renderiza a aplicação
    Object.keys(comp).forEach(function(child) {

        if(child != '_prop') {
            var ref = (refParent ? refParent+'/' : '')+(refChild ? refChild : child)
            var obj = comp[child]
            var prop = comp[child]._prop
            var className = ref.replace(/\//g, '__')

            if(prop._matrixClass) className = prop._matrixClass

            // Criando objetos dinâmicos para lista de array
            if(Array.isArray(prop.content) && !prop._matrix) {
                var refObject = ref.split('/')
                var parentAddress = 'app'

                refObject.pop()
                refObject.forEach(function(el) {parentAddress += `["${el}"]`})
                parentAddress = eval(parentAddress)

                prop.content.forEach(function(el) {
                    // cópia profunda
                    parentAddress['$dynamicNode'+listNumber] = JSON.parse(JSON.stringify(obj)) 
                    parentAddress['$dynamicNode'+listNumber]._prop.content = el
                    parentAddress['$dynamicNode'+listNumber]._prop._matrixClass = className

                    // Copiando os eventos e ações
                    function copyChildren(elParent1, elParent2) {
                       elParent2._prop.attributes = {...elParent1._prop.attributes, ...{dataIndex: listNumber}}

                        Object.keys(elParent1).forEach(function(elChild) {
                            if(elChild != '_prop') {
                                var prop1 = elParent1[elChild]._prop
                                var prop2 = elParent2[elChild]._prop

                                prop2.attributes = {...prop1.attributes, ...{dataIndex: listNumber}}

                                Object.keys(prop1).forEach(function(elProp) {
                                    if(elProp == 'events' || elProp == 'actions') {
                                        prop2[elProp] = prop1[elProp]
                                    }
                                })
                                
                                if(Object.keys(elParent1).length > 1) {
                                    copyChildren(elParent1[elChild], elParent2[elChild])
                                }
                            }
                        })
                    }
                    copyChildren(obj, parentAddress['$dynamicNode'+listNumber])
                    listNumber++
                })
                prop._matrix = true
                return render(parentAddress._prop._element, parentAddress, refParent, child)
            }
        
            // Mesclar objeto default para setar atributos ausentes
            prop = {...{
                tag: 'div',
                attributes: {},
                style: {},
                events: {},
                actions: null,
            }, ...prop}

            // Guardando em _prop a referência do elemento no DOM
            prop._element = createElement(prop.tag)

            // Adicionando Proxy
            obj._prop = onChange({
                proxyObject: prop,
                proxyParent: obj,
                fnSet: function(target, key, value) {
                    if(key == 'content') {
                        var isMatrix = target._prop._element.innerHTML.lastIndexOf('_matrix')
                        var isParent = target._prop._element.innerHTML.lastIndexOf('</')

                        if(isParent > -1 || isMatrix > -1) {
                            app = setApp(data)
                            $('#app').innerHTML = ''
                            styleSheet = {}
                            listNumber = 0
                            render($('#app'), app)
                        }
                        else {
                            target._prop._element.innerHTML = value
                        }
                    }
                }
            })
            obj._prop.style = onChange({
                proxyObject: prop.style, 
                proxyParent: prop, 
                fnSet: (target, key, value) => {
                    target._element.css({[key]: value})
                },
                fnDelete: (target, key) => {
                    target._element.css(target.style, true)
                }
            })
            obj._prop.attributes = onChange({
                proxyObject: prop.attributes, 
                proxyParent: prop,
                fnSet: (target, key, value) => {
                    target._element.attr({[key]: value})
                },
                fnDelete: (target, key) => {
                    target._element.removeAttribute(camelToKebab(key))
                }
            })    
            obj._prop.events = onChange({
                proxyObject: prop.events, 
                proxyParent: prop, 
                fnSet: (target, key, value) => {
                    target._element.addEventListener(key, function() {
                        eventListener(value)
                    }, false)
                },
                fnDelete: (target, key) => {
                    console.warn('Item removido do objeto, mas listener permanece no DOM')
                }
            })

            // Executando ações
            if(prop.actions != null) {
                obj._prop.actions.bind(prop)()
            }

            if(!prop._matrix) {
                // Aplicando estilo
                if(Object.keys(prop.style).length > 0) {
                    var styleLessChildren = {...prop.style}
                    if(prop.style.children) delete styleLessChildren.children

                    styleSheet['.'+className] = styleLessChildren

                    if(prop.style.children) {
                        Object.keys(prop.style.children).forEach(function(attr) {
                            styleSheet['.'+className+attr] = prop.style.children[attr]
                        })
                    }
                }
                
                // Aplicando atributos e estilos
                prop._element.attr(prop.attributes)
                prop._element.attr({class: camelToKebab(className)})

                // Escutando eventos
                Object.keys(prop.events).forEach(function(type) {
                    prop._element.addEventListener(type, function() {
                        prop.events[type].apply(prop, [this, data])
                    }, false)
                })
                    
                // Inserindo elemento ao container
                if(!prop._matrix) container.appendChild(prop._element)
            }

            // Aplicando conteúdo
            if(prop._matrix) prop._element.innerHTML = '_matrix'
            else if(prop.content) prop._element.innerHTML = prop.content

            // Chamado recursivamente
            if(Object.keys(obj).length > 1) {
                render(prop._element, obj, ref)
            }
        }
    })
}
render($('#app'), app)
                   

// Aplicando CSS
var css = camelToKebab(JSON.stringify(styleSheet))
var style = ($('style')) ? $('style') : document.createElement('style')

style.type = "text/css"
style.innerHTML = style.innerHTML+'\n'+css.substring(1, css.length-1)
    .replace(/,"/g, ';\n')
    .replace(/"/g, '')
    .replace(/:{/g, '\n{\n')
    .replace(/};/g, ';\n}\n')
    .replace(/`/g, '\'')

document.head.appendChild(style)
