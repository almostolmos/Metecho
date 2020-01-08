import React from 'react';


//TODO:
// - Make these useful cards.
// - Insert these in the correct place in the document.
// - The list of Repo users should probably be a modal, and a separate
//   component, compared to the list of Project users, yes?

const UserCard = ({ user, addToProject }) => <li onclick={() => addToProject(user)}>{user.login}</li>;

export default ({ users }) => (
  const addToProject = (user) => {
    // What pattern are we using here? Should this go through the store,
    // triggering an API call incidentally, or just send an API call directly?
  }

  <ul>
    {users.map((user) => (
      <UserCard user={user} addToProject={addToProject} />
    ))}
  </ul>
);
