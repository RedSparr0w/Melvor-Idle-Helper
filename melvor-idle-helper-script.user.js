// ==UserScript==
// @name         Melvor Idle Helper
// @namespace    https://github.com/RedSparr0w/Melvor-Idle-Helper
// @version      0.1.3
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
baseMiningInterval
miningData
smeltInterval
smithingBars
smithingBarID
smithInterval
baseThievingInterval
thievingNPC
farmingAreas
*/

(function() {
    'use strict';

    const waitForPage = setInterval(() => {
        const changeLog = document.getElementById('changelog-body-container');
        if (!changeLog || !changeLog.innerText){
            return;
        }
        // Page is loaded
        clearInterval(waitForPage);

        // Functions that can be run now
        woodcuttingCalc();
        miningCalc();
        smeltingCalc();
        thievingCalc();

        // Add our event listeners
        [...document.getElementById('smithing-bar-selection').getElementsByTagName('button')].forEach(el=>el.addEventListener('click', smithingCalc));

        // Run these functions every 500ms
        let runInterval = setInterval(() => {
            farmingTick();
        }, 500)

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

const miningCalc = () => {
    // Always takes the same amount of time
    const seconds = baseMiningInterval / 1000;
    miningData.forEach((ore, i) => {
        const item = items[ore.ore];
        const xp = item.miningXP;
        const xp_ps = +(xp / seconds).toFixed(1);
        const gp = item.sellsFor;
        const gp_ps = +(gp / seconds).toFixed(1);

        const mine_container = document.getElementById(`mining-ore-${i}`);
        if (!mine_container) return;
        const mine_el = mine_container.getElementsByClassName('block-content')[0];
        addCalcToEl(mine_el, xp_ps, gp_ps);
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

const farmingTick = () => {
  const now = Date.now();
    farmingAreas.forEach((area, area_id) => {
        area.patches.forEach((patch, patch_id) => {
            if (!patch.timePlanted) return;
            // Minimum of 0 for timeRemaining
            const timeRemaining = new Date(Math.max(0, patch.timePlanted + (items[patch.seedID].timeToGrow * 1000) - now));
            const timeLeftStr = `${(timeRemaining.getUTCHours()+'').padStart(2,0)}:${(timeRemaining.getUTCMinutes()+'').padStart(2,0)}:${(timeRemaining.getUTCSeconds()+'').padStart(2,0)}`;
            updateFarmingPatchTimer(area_id, patch_id, timeLeftStr);
        });
    });
}

const updateFarmingPatchTimer = (area_id, patch_id, timeLeftStr) => {
    let timer_el = document.getElementById(`farming-timer-${area_id}-${patch_id}`);
    if (!timer_el) {
        let patch_el = document.getElementById(`farming-patch-${area_id}-${patch_id}`)
        if (!patch_el) return;
        patch_el = patch_el.getElementsByClassName('block-content')[0];

        // create our helper elements
        const helper_container = document.createElement('div');
        helper_container.className = 'font-size-sm font-w600 text-right text-uppercase text-muted';
        helper_container.style = 'position: absolute; right: 6px; top: 8px;';

        // Create our timer element
        timer_el = document.createElement('small');
        timer_el.id = `farming-timer-${area_id}-${patch_id}`;
        helper_container.appendChild(timer_el);

        // Needs these classes for the text to show correctly
        patch_el.classList.add('ribbon', 'ribbon-light', 'ribbon-bookmark', 'ribbon-left');
        patch_el.appendChild(helper_container);
    }
    timer_el.innerText = timeLeftStr;
}
