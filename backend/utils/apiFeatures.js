class ApiFeatures{
    constructor(query,queryStr){ //here queryStr is the keyword we search for in the api request
        this.query = query;
        this.queryStr= queryStr;
    }

    //search keywords
    search(){
        const keyword = this.queryStr.keyword ? {
            name :{
                $regex:this.queryStr.keyword,
                $options: "i",      //will give us keyword
            },
        }
        :{};

        // console.log(keyword);

        this.query = this.query.find({...keyword});
        return this;//call the function
    }

    // for category

    filter(){
        const queryCopy = {...this.queryStr}    //spreadout oprator, creating actual copy of queryStr so that original doesnt get modified

        //remove some fields for category
        const removeFields = ["keyword","page","limit"];

        removeFields.forEach(key =>delete queryCopy[key]);

        //Filter for Price and Rating

        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g,key =>`$${key}`); // replaces str example - gt it replaces complte gt with the string.
        

        // this.query = this.query.find(queryCopy);//to find category, case sensitive
        
        // Convert above string to object.
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    pagination(resultPerPage){
        const currentPage = Number(this.queryStr.page) || 1; //default page 1

        const skip = resultPerPage * (currentPage - 1);

        this.query = this.query.limit(resultPerPage).skip(skip); //limit will set the limit to view the data on page

        return this;
    }
};


module.exports = ApiFeatures;

