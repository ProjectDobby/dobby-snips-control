let object;

const init = (ob) => {
    object = ob;
};

const getSlot = (name, ob = object) => {
    try {
        return ob.filter(slot => slot.slotName === name)[0].value.value;
    } catch (e) {
        return null;
    }
};

const getSlots = (ob = object) => {
    const map = new Map();
    try {
        ob.forEach(slot => {
            map.set(slot.slotName, slot.value.value);
            map[slot.slotName] = slot.value.value;
        });
        return map;
    } catch (e) {
        console.log(e);
        return null;
    }
};

module.exports = {getSlot, getSlots, init};
