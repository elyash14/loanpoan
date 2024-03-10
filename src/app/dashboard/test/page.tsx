import { createUser } from "@database/user/actions";
import { getUsers } from "@database/user/data";

export default function Test() {
  return (
    <main>
      <CreateUser />
      <h3>List</h3>
      <UsersList />
    </main>
  );
}

const UsersList = async () => {
  const users = await getUsers();
  console.log("users", users);

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.email}</li>
      ))}
    </ul>
  );
};

const CreateUser = () => {
  return (
    <form action={createUser}>
      <label htmlFor="">
        Email
        <input type="text" name="email" />
      </label>
      <br />
      <br />
      <label htmlFor="">
        Password
        <input type="text" name="password" />
      </label>
      <br />
      <br />
      <label htmlFor="">
        First name
        <input type="text" name="firstName" />
      </label>
      <br />
      <br />
      <label htmlFor="">
        Last name
        <input type="text" name="lastName" />
      </label>
      <br />
      <br />
      <button type="submit">Save</button>
    </form>
  );
};
