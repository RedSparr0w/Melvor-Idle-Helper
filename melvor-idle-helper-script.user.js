// ==UserScript==
// @name         Melvor Idle Helper
// @namespace    https://github.com/RedSparr0w/Melvor-Idle-Helper
// @version      0.0.1
// @description  Help figure out what you want to focus on skilling
// @license      MIT
// @author       RedSparr0w
// @match        http*://melvoridle.com/
// @grant        none
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/RedSparr0w/Melvor-Idle-Helper/master/melvor-idle-helper-script.user.js
// @downloadURL  https://raw.githubusercontent.com/RedSparr0w/Melvor-Idle-Helper/master/melvor-idle-helper-script.user.js
// ==/UserScript==
/*
globals
// Define global variables here
CONSTANTS
items
trees
smeltInterval
smithingBars
smithingBarID
smithInterval
*/

(function() {
    'use strict';

    const waitForPage = setInterval(() => {
        if (!document.querySelectorAll(`[href*="smeltBar(0)"]`)[0]){
            return;
        }
        clearInterval(waitForPage);
        woodcuttingCalc();
        smeltingCalc();
    }, 100);
})();

const addCalcToEl = (el, xp_ps, gp_ps) => {
    if (!el || !el.appendChild) return;

    // create our helper elements
    const helper_container = document.createElement('div');
    helper_container.className = 'font-size-sm font-w600 text-right text-uppercase text-muted';
    helper_container.style = 'position: absolute; right: 6px; top: 8px;';

    const xp_ps_el = document.createElement('small');
    xp_ps_el.innerText = xp_ps + ' XP/s';
    const gp_ps_el = document.createElement('small');
    gp_ps_el.innerText = gp_ps + ' GP/s';

    // add the elements to our container
    helper_container.appendChild(xp_ps_el);
    helper_container.appendChild(document.createElement('br'));
    helper_container.appendChild(gp_ps_el);
    // add to the page
    el.appendChild(helper_container);
}

const woodcuttingCalc = () => {
    // Woodcutting
    trees.forEach(tree => {
        const itemName = tree.type;
        const seconds = (tree.interval / 1000);
        const xp = tree.xp;
        const xp_ps = +(xp / seconds).toFixed(2);
        const gp = items.find(item=>new RegExp('^' + itemName, 'i').test(item.name)).sellsFor;
        const gp_ps = +(gp / seconds).toFixed(2);

        const tree_container = document.getElementById(`woodcutting_tree_${itemName}`)
        if (!tree_container) return;
        const tree_el = tree_container.getElementsByClassName('block-content')[0];
        addCalcToEl(tree_el, xp_ps, gp_ps);
    });
}

const smeltingCalc = () => {
    const seconds = smeltInterval / 1000;
    smithingBars.forEach((bar, i)=>{
        const item = items.find(item=>new RegExp('^' + bar + ' bar', 'i').test(item.name));
        const xp = item.smithingXP;
        const xp_ps = +(xp / seconds).toFixed(2);
        const gp = item.sellsFor;
        const gp_ps = +(gp / seconds).toFixed(2);

        const smelt_container = document.querySelectorAll(`[href*="smeltBar(${i})"]`)[0];
        if (!smelt_container) return;
        const smelt_el = smelt_container.getElementsByClassName('block-content')[0];
        addCalcToEl(smelt_el, xp_ps, gp_ps);
    });
}
