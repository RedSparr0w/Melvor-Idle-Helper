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
        addSettings();
        addButtons();
        woodcuttingCalc();
        miningCalc();
        thievingCalc();

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
    }, 200);
})();

    </div>`);
const addButtons = () => {
    // Farming
    $('#farming-area-container').before(`<div class="col-12">
        <button class="btn btn-info m-1" onclick="compostAll();" title="Compost all plots in current farming area">Compost All</button>
        <button class="btn btn-info m-1" onclick="harvestAll();" title="Harvest all plots in current farming area">Harvest All</button>
      </div>`);
}

const addCalcToEl = (el, data = []) => {
    if (!el || !el.appendChild) return;

    // create our helper elements
    const helper_container = document.createElement('div');
    helper_container.className = 'font-size-sm font-w600 text-right text-uppercase text-muted';
    helper_container.style = 'position: absolute; right: 6px; top: 8px;';

    data.forEach((dat, i)=>{
        // Add line break if not first element
        if (i > 0) helper_container.appendChild(document.createElement('br'));
        const el = document.createElement('small');
        el.innerText = dat;
        helper_container.appendChild(el);
    });

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
        addCalcToEl(tree_el, [xp_ps + ' XP/s', gp_ps + ' GP/s']);
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
        addCalcToEl(mine_el, [xp_ps + ' XP/s', gp_ps + ' GP/s']);
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
        addCalcToEl(npc_el, [xp_ps + ' XP/s']);

        // Add the popovers for the loot
        npc_el.classList.add('js-popover');
        const npc_el_data = npc_el.dataset;
        npc_el_data.toggle = 'popover';
        npc_el_data.html = 'true';
        npc_el_data.placement = 'bottom';
        npc_el_data.content = popoutText.join('<br/>');
    });
}

// Farming

const farmingTick = () => {
    if (currentFarmingArea === null) return;
    const now = Date.now();
    const area_id = currentFarmingArea;
    const area = farmingAreas[area_id];
    area.patches.forEach((patch, patch_id) => {
        if (!patch.timePlanted) return;
        const timeRemaining = new Date(patch.timePlanted + (items[patch.seedID].timeToGrow * 1000) - now);
        // If no time remains, leave it empty
        const timeLeftStr = timeRemaining <= 0 ? '' : `${(timeRemaining.getUTCHours()+'').padStart(2,0)}:${(timeRemaining.getUTCMinutes()+'').padStart(2,0)}:${(timeRemaining.getUTCSeconds()+'').padStart(2,0)}`;
        updateFarmingPatchTimer(area_id, patch_id, timeLeftStr);
    });
}

const updateFarmingPatchTimer = (area_id, patch_id, timeLeftStr) => {
    let timer_el = document.getElementById(`farming-timer-${area_id}-${patch_id}`);
    // If there is no timer element, create it
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

const harvestAll = () => {
    // This will only harvest plots on the current page
    [...document.querySelectorAll(`[onclick^=harvestSeed`)].forEach(el=>el.click());
}

const compostAll = () => {
    // This will only compost plots on the current page
    [...document.querySelectorAll(`[onclick^=addCompost`)].forEach(el=>{
        for(i = 0; i < 5; i++)
            el.click();
    });
}
