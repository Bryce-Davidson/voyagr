function updater(obj, update) {
    update = flatten(update)
    for (key in update) {
        obj[key] = update[key]
    }
}