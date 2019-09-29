// ==UserScript==
// @name         Melvor Idle Helper
// @namespace    https://github.com/RedSparr0w/Melvor-Idle-Helper
// @version      0.0.4
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
$
CONSTANTS
items
trees
smeltInterval
smithingBars
smithingBarID
smithInterval
baseThievingInterval
thievingNPC
*/

(function() {
    'use strict';

    const waitForPage = setInterval(() => {
        if (!document.querySelectorAll(`[href*="smeltBar(0)"]`)[0]){
            return;
        }
        // Page is loaded
        clearInterval(waitForPage);

        // Functions that can be run now
        woodcuttingCalc();
        smeltingCalc();
        thievingCalc();

        // Add our event listeners
        [...document.querySelectorAll('[onclick^="loadAnvil"]')].forEach(el=>el.addEventListener('click', smithingCalc));

        // Enable the popovers
        $('.js-popover').popover({
            container: 'body',
            animation: false,
            trigger: 'hover focus',
        });
    }, 100);
})();

const addCalcToEl = (el, xp_ps, gp_ps = false) => {
    if (!el || !el.appendChild) return;

    // create our helper elements
    const helper_container = document.createElement('div');
    helper_container.className = 'font-size-sm font-w600 text-right text-uppercase text-muted';
    helper_container.style = 'position: absolute; right: 6px; top: 8px;';

    const xp_ps_el = document.createElement('small');
    xp_ps_el.innerText = xp_ps + ' XP/s';
    helper_container.appendChild(xp_ps_el);

    // If we are calculating gp/s aswell then include this
    if (gp_ps) {
        const gp_ps_el = document.createElement('small');
        gp_ps_el.innerText = gp_ps + ' GP/s';
        helper_container.appendChild(document.createElement('br'));
        helper_container.appendChild(gp_ps_el);
    }

    // Needs these classes for the text to show correctly
    el.classList.add('ribbon', 'ribbon-light', 'ribbon-bookmark', 'ribbon-left');
    el.appendChild(helper_container);
}

const woodcuttingCalc = () => {
    trees.forEach(tree => {
        const itemName = tree.type;
        const seconds = (tree.interval / 1000);
        const xp = tree.xp;
        const xp_ps = +(xp / seconds).toFixed(1);
        const gp = items.find(item=>new RegExp('^' + itemName, 'i').test(item.name)).sellsFor;
        const gp_ps = +(gp / seconds).toFixed(1);

        const tree_container = document.getElementById(`woodcutting_tree_${itemName}`)
        if (!tree_container) return;
        const tree_el = tree_container.getElementsByClassName('block-content')[0];
        addCalcToEl(tree_el, xp_ps, gp_ps);
    });
}

const smeltingCalc = () => {
    // Always takes the same amount of time
    const seconds = smeltInterval / 1000;
    smithingBars.forEach((bar, i) => {
        const item = items.find(item=>new RegExp('^' + bar + ' bar', 'i').test(item.name));
        const xp = item.smithingXP;
        const xp_ps = +(xp / seconds).toFixed(1);
        const gp = item.sellsFor;
        const gp_ps = +(gp / seconds).toFixed(1);

        const smelt_container = document.getElementById(`smithing-furnace-bar-${i}`);
        if (!smelt_container) return;
        const smelt_el = smelt_container.getElementsByClassName('block-content')[0];
        addCalcToEl(smelt_el, xp_ps, gp_ps);
    });
}

const smithingCalc = () => {
    // Always takes the same amount of time
    const seconds = smithInterval / 1000;
    items.filter(item=>item.smithingXP && !/bar$/i.test(item.name)).forEach((item, i) => {
        const xp = item.smithingXP;
        const xp_ps = +(xp / seconds).toFixed(1);
        const gp = item.sellsFor;
        const gp_ps = +(gp / seconds).toFixed(1);

        const smith_container = document.getElementById(`smithing-anvil-item-${item.id}`);
        if (!smith_container) return;
        const smith_el = smith_container.getElementsByClassName('block-content')[0];
        addCalcToEl(smith_el, xp_ps, gp_ps);
    });
}

const thievingCalc = () => {
    // Always takes the same amount of time
    const seconds = baseThievingInterval / 1000;
    thievingNPC.forEach((npc, id) => {
        const xp_ps = +(npc.xp / seconds).toFixed(1);

        // Get the loottable text
        let popoutText = [`<img src='http://melvoridle.com/assets/media/main/coins.svg' height='20px'> ${npc.maxCoins} coins (max)`];
        const totalWeight = npc.lootTable.reduce((a,b)=>a + b[1], 0);
        npc.lootTable.forEach(loot => {
            const item = items[loot[0]];
            popoutText.push(`<img src='${item.media}' height='20px'> ${item.name} - ${((loot[1] / totalWeight) * 100).toFixed(1)}%`);
        });

        const npc_el = document.getElementById(`thieving-npc-${id}`).getElementsByClassName('block-content')[0];

        // Add the xp/s amounts
        addCalcToEl(npc_el, xp_ps);

        // Add the popovers for the loot
        npc_el.classList.add('js-popover');
        const npc_el_data = npc_el.dataset;
        npc_el_data.toggle = 'popover';
        npc_el_data.html = 'true';
        npc_el_data.placement = 'bottom';
        npc_el_data.content = popoutText.join('<br/>');
    });
}
