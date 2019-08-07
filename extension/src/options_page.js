/* @flow */
import {unwrap} from './common';
import {get_options_async, setOptions} from './options';
import {defensifyAlert, alertError} from './notifications';

// $FlowFixMe
import reqwest from 'reqwest';

function getInputElement(element_id: string): HTMLInputElement {
    return ((document.getElementById(element_id): any): HTMLInputElement);
}

function getHost(): HTMLInputElement {
    return getInputElement('host_id');
}

function getToken(): HTMLInputElement {
    return getInputElement('token_id');
}

function getDots(): HTMLInputElement {
    return getInputElement('dots_id');
}

function getBlackList(): HTMLInputElement {
    return getInputElement('blacklist_id');
}

function getTagMap(): HTMLInputElement {
    return getInputElement('tag_map_id');
}

function getExtraCss(): HTMLInputElement {
    return getInputElement('extra_css_id');
}

// TODO display it floating


document.addEventListener('DOMContentLoaded', defensifyAlert(async () => {
    const opts = await get_options_async();
    getHost().value      = opts.host;
    getDots().checked    = opts.dots;
    getToken().value     = opts.token;
    getBlackList().value = opts.blacklist.join('\n');
    getTagMap().value    = JSON.stringify(opts.tag_map);
    getExtraCss().value  = opts.extra_css;
}));

unwrap(document.getElementById('test_id')).addEventListener('click', defensifyAlert(async() => {
    const host = getHost().value;
    const token = getToken().value;

    await reqwest({
        url: `${host}/ping`,
        method: 'post',
        headers: {
            'Authorization': "Basic " + btoa(token),
        },
        timeout: 1000, // 1s
    }).then(res => {
        alert(`Success! Response: ${res}`);
    }, err => {
        // TODO ugh. unclear how to transform error object, nothing seemed to work.
        // that results in two error alerts, but I guess thats' not so bad..
        alertError(`${err.status} ${err.statusText} ${err.response}`);
    });
}));

// TODO careful here if I ever implement not showing notifications?
// defensify might need to alert then...
unwrap(document.getElementById('save_id')).addEventListener('click', defensifyAlert(async () => {
    const opts = {
        host      : getHost().value,
        dots      : getDots().checked,
        token     : getToken().value,
        // this is preserving whitespaces so might end up with '' entries
        // but perhaps it's ok; lets the user space out blacklist entries
        // TODO also make sure we don't reorder entries in settings without user's permissions
        // I guess the real solution is blacklist object which keeps textual repr separately
        blacklist : getBlackList().value.split(/\n/),
        tag_map   : JSON.parse(getTagMap().value),
        extra_css : getExtraCss().value,
    };
    await setOptions(opts);
    alert("Saved!");
}));
