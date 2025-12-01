exports.handleNotFound = (resource, res, name = 'Resource') => {
    if(!resource){
        res.status(404).json({message: `${name} not found`});
        return true;
    }
    return false;
};

exports.handleServerError = (res, message, err) => {
    console.error(err);
    res.status(500).json({message});
};