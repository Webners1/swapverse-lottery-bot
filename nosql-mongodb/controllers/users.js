import User from "../models/User.js";

//CRUD operations on the User model. Try: GET, POST, PUT, DELETE, then send a status of success and the json of the entries matching the conditions. Catch send a status of error and the error message.For each operation that is performed on the route users/:id, we need to extract the id from the request parameter

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: error.message });
  }
};

///////////////////////////////////////////////// UNCOMMENT FOR SOLUTION WITH req.query////////////////////////
// export const getAllUsers = async (req, res) => {
//   try {
//     ///Model.find()'s default behavior is that it will return all documents in the model, so if none of the properties passed exist, you will instead get back all the documents. So if you use .find(req.query), have a fallback solution
//     console.log("req query", req.query);
//     //find instances of the User model that match the query / queries. With .collation({}) we make our query case-insensitive.
//     const filteredUsers = await User.find(req.query).collation({
//       locale: "en",
//       strength: 2,
//     });
//     //if entry matches the query, send a text back
//     if (!filteredUsers.length) {
//       console.log("nope");
//       return res
//         .status(400)
//         .send("No users are matching this query in the database");
//     }
//     return res.status(200).json(filteredUsers);
//   } catch (err) {
//     console.log(err);
//   }
// };

export const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;
    const singleUser = await User.findById(id);
    res.status(200).json(singleUser);
    console.log(singleUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { first_name, last_name, age } = req.body;
    const newUser = await User.create({ first_name, last_name, age });
    res.status(201).json(newUser);
    console.log(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    res.status(200).json(deletedUser);
    console.log(deletedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, age } = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json(updatedUser);
    console.log(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
