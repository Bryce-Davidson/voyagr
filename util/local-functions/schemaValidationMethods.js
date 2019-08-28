module.exports = {
    isOwner: function (instance, user) {
        if(!instance.user) throw new Error('Please pass in valid instance')
        return instance.user == user;
    }, 
    userCanAlter: function(instance, user, res) {
        if (!instance) { res.status(404).send("Document does not exist."); return false}
        if (instance.user != user) { res.status(401).send("User unauthorized"); return false}
        else return true;
    }
}