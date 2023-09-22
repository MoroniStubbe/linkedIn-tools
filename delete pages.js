// ==UserScript==
// @name         LinkedIn Delete Pages
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.linkedin.com/mynetwork/*
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

    async function deletePages(){
        let list = getElement(['mynetwork', 'Following']);
        for(let i = 0; i < list.length; i++){
            list[i].parentElement.click();
            await sleep(1000);
            getElement(['artdeco-modal-outlet', 'Unfollow'])[1].parentElement.click();
            await sleep(1000);
        }
    }
    await sleep(5000);
    bindToButton(deletePages, getElement(['mynetwork', 'Pages'])[0].parentElement);
})();