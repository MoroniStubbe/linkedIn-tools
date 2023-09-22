// ==UserScript==
// @name         LinkedIn Save Matches
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.linkedin.com/jobs/search/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=linkedin.com
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(async function() {
    'use strict';
    function traverseChildren(element, callback, args, firstInstance = true, resultStack = []) {
        let result = callback(element, args)
        if(result)
        {
            resultStack.push(result);
        }
        let children = element.children;
        for (let i = 0; i < children.length; i++) {
            traverseChildren(children[i], callback, args, false, resultStack);
        }
        if(firstInstance){
            return resultStack;
        }
    }

    //path = [id or class or index, index1, index2, ...]
    function getElement(path) {
        let i = 0
        let element;
        if (typeof path[i] == 'string') {
            element = document.getElementById(path[i]);
            if (!element) {
                return;
            }
            i++;
        }
        if (path.length > 1) {
            for (i; i < path.length; i++) {
                //returns array of elements because multiple elements could contain the string
                if(typeof path[i] == 'string'){
                    function getElementContainingString(element, string){
                        for(let i2 = 0; i2 < element.childNodes.length; i2++){
                            let childNode = element.childNodes[i2];
                            if(childNode.nodeType === Node.TEXT_NODE){
                                if(childNode.nodeValue.includes(string)){
                                    return element;
                                }
                            }
                        }
                    }
                    return traverseChildren(element, getElementContainingString, path[i]);
                }
                else{
                    element = element.children[path[i]];
                }
            }
        }
        return element;
    }

    async function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function bindToButton(func, parent, name = ''){
        let button = document.createElement('button');
        if(name){
            button.innerText = name;
        }
        else{
            button.innerText = func.name;
        }
        button.onclick = func;
        parent.append(button);
    }

    async function saveMatches(){
        GM_setValue('save', true);
        GM_setValue('saveCount', 0);
        let skills = ['Python', 'JavaScript', 'SQL', 'PHP', 'CSS', 'Java', 'HTML'];
        let scroll = getElement(['main', 0, 0, 1]);
        let items = getElement(['main', 0, 0, 1, 2]);
        if(items && items.tagName == 'UL'){
            items = items.children;
            for(let i = 0; i < items.length; i++){
                scroll.scrollTo({
                    top: scroll.scrollHeight,
                    behavior: "smooth"
                });
                //weird bug that makes element not load. but when i inspect element the element shows it is loaded.
                if(items[i].children && items[i].children.length > 0
                   && items[i].children[0].children && items[i].children[0].children.length > 0){
                    items[i].children[0].children[0].click();
                    await sleep(5000);
                    let saveText = getElement(['main', 'Save']);
                    if(saveText && saveText.length > 0){
                        saveText = saveText[0];
                        if(saveText.innerText !== 'Saved'){
                            let saveButton = saveText.parentElement;
                            let appSkills = getElement(['main', 'Skills: ']);
                            if(appSkills && appSkills.length > 0){
                                appSkills = appSkills[0];
                                if(skills.includes(appSkills.innerText.slice(8).split(',')[0])){
                                    saveButton.click();
                                    GM_setValue('saveCount', GM_getValue('saveCount') + 1);
                                    await sleep(2000);
                                }
                            }
                        }
                    }
                }
            }
            if(window.location.href.includes('&start=')){
                let regex = /\d+$/;
                let start = (parseInt(window.location.href.match(regex)[0]) + 25).toString();
                window.location.href = window.location.href.replace(regex, start);
            }
            else{
                window.location.href = window.location.href + '&start=25';
            }
            await sleep(5000);
            console.log('saved ' + GM_getValue('saveCount').toString() + ' matches');
            saveMatches();
        }
        else{
            GM_setValue('save', false);
        }
    }

    await sleep(5000);
    bindToButton(saveMatches, getElement(['global-nav']));
    if(GM_getValue('save')){
        saveMatches();
    }
})();