module.exports = {
   async collisionPaths(locationPhotos, reqFiles) {
        // get keys of req.files aka: field names
        let newPhotoKeys = Object.keys(reqFiles);
        let deletePaths = [];
        // for each field name in upload check if the location.photos 
        // has that field name present as a key
        newPhotoKeys.forEach(key => {
          // if the location has the key
          if (locationPhotos[key]) {
            // take the path out of the key and get the S3 path-key to delete
            let path = locationPhotos[key].split('/')
            path = path[path.length - 1]
            deletePaths.push(path)
          }
        })
        return deletePaths;
      },
      async newPhotoPaths(target, filesobj) {
        let update = {};
        Object.entries(filesobj).forEach(([key, val]) => {
          update[key] = val[0].location
        });
        return Object.assign(target, update)
      }
}