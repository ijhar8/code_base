resources
https://jasonwatmore.com/post/2018/11/28/nodejs-role-based-authorization-tutorial-with-example-api







//API filters

1:- sortby (sorting by column name) 
    default:createdAt

2:- sort(ascending order(1)/descending order(-1))
  default: 1

3:- where[columnname](search in coulmn name )
    default:isDeleted:false

4:- limt(limit/page )
    default:10
5:-page (current page index)
    default:1





//User default permission
  AuthController.js
   let permissions=  [
    
        "user:read",
        "user:write"
      ]



1:-post user/create 

request object ={
    "email":"rt4rx@gmail.com",
    "password":"12345678",
    "confirmPassword":"12345678",
    "firstName":"f",
            "lastName":"lastName",
            "employeeId":"employeeIdr",
            "employeeOrgnization":"employeeOrgnizationr"
    
}

2:- post /auth/login 

request object ={
	
	"email":"ijhar@gmail.com",
	"password":"123456789"
       
}

response {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZTFjMDYyMGI0OWEyMjJiMGM1ZThlNTUiLCJwZXJtaXNzaW9ucyI6WyJ1c2VyOnJlYWQiLCJ1c2VyOndyaXRlIl0sImlhdCI6MTU3ODg5NTM3NH0.UVEn-pNnc2qMKPRgMO9GtnnjpWxGngFuVNaSMSVrmXw"
}

3:- get /user/list?token=usertoken

4:- post /user/updaterole
     
    request {
	"_id":"5e1d94ed7394351a740a8b40",
	"roles":[roleID1,roleID2]
    }

    

** Roles api point **

4:- get /admin/acl/roles
   
   response {
            "permissions": [],
            "isDeleted": false,
            "createdBy": "5e1c0620b49a222b0c5e8e55",
            "updatedBy": "-",
            "_id": "5e1d85cfa6e96e08f0e27c52",
            "name": "sssssr",
            "createdAt": "2020-01-14T09:11:43.170Z",
            "updatedAt": "2020-01-14T09:11:43.170Z",
            "__v": 0
    }
5:- post /acl/createrole

    request {
    "name": "11wwwss",
    "permissions":["read","lol"]
    }









all permissions names
[
  {
    "_id": "5e2044d4e06a052af81462d0",
    "name": "view_roles "
  },
  {
    "_id": "5e2066d2e06a052af81462d2",
    "name": "view_users"
  },
  {
    "_id": "5e20671be06a052af81462d3",
    "name": "create_role"
  },
  {
    "_id": "5e20691fe06a052af81462d4",
    "name": "view_permissions"
  },
  {
    "_id": "5e206945e06a052af81462d5",
    "name": "add_user"
  },
  {
    "_id": "5e206983e06a052af81462d6",
    "name": "view_user_role"
  },
  {
    "_id": "5e206995e06a052af81462d7",
    "name": "update_user_role"
  },
  {
    "_id": "5e2146ad9cbba520d432f1bc",
    "name": "update_role"
  },
  {
    "_id": "5e2146c19cbba520d432f1bd",
    "name": "delete_role"
  },
  {
    "_id": "5e2146d59cbba520d432f1be",
    "name": "restore_role"
  },
  {
    "_id": "5e2147029cbba520d432f1bf",
    "name": "view_role"
  },
  {
    "_id": "5e215c399cbba520d432f1c0",
    "name": "update_user"
  },
  {
    "_id": "5e215c549cbba520d432f1c1",
    "name": "delete_user"
  },
  {
    "_id": "5e215c619cbba520d432f1c2",
    "name": "restore_user"
  }
]