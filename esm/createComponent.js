import app from './app';
function render(node, parent, idx) {
    const { tag, props, children } = node;
    let key = `_${idx}`;
    let id = props && props['id'];
    if (!id)
        id = `_${idx}${Date.now()}`;
    else
        key = id;
    if (!parent.__componentCache)
        parent.__componentCache = {};
    let component = parent.__componentCache[key];
    if (!component) {
        component = parent.__componentCache[key] = new tag(Object.assign(Object.assign({}, props), { children })).mount(id);
        component['__eid'] = id;
    }
    else {
        id = component['__eid'];
    }
    let state = component.state;
    if (component.mounted) {
        const new_state = component.mounted(props, children, state);
        if (typeof new_state !== 'undefined')
            state = component.state = new_state;
    }
    if (state instanceof Promise) {
        const render = el => {
            component.element = el;
            component.setState(state);
        };
        return app.createElement("section", Object.assign({}, props, { id: id, ref: e => render(e) }));
    }
    else {
        const vdom = component._view(state, props);
        const render = el => {
            component.element = el;
            component.renderState(state, vdom);
        };
        return app.createElement("section", Object.assign({}, props, { id: id, ref: e => render(e) }), vdom);
    }
}
let _idx = 0;
export default function createComponent(node, parent, idx = 0) {
    if (idx === 0)
        _idx = 0;
    if (typeof node === 'string')
        return node;
    if (Array.isArray(node))
        return node.map(child => createComponent(child, parent, _idx));
    let vdom = node;
    if (node && typeof node.tag === 'function' && Object.getPrototypeOf(node.tag).__isAppRunComponent)
        vdom = render(node, parent, _idx++);
    if (vdom && Array.isArray(vdom.children))
        vdom.children = vdom.children.map(child => createComponent(child, parent, _idx));
    return vdom;
}
//# sourceMappingURL=createComponent.js.map