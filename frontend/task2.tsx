/**
# Code Review - FE

**Task**: You'll review a junior developer's code

- Are you see any error?
- What would you change, do differently?
- In which direction would you guide it?

Your colleague created a component where you could see various data about the logged in user, and they could log out.
This component will be part of a dashboard view.
 */
// Example user:

// types.ts


// Define types for user history
interface UserHistoryEvent {
  event: 'login' | 'logout';
  time: string; // ISO date string
}

// Type for the cancelable promise result
interface CancelablePromise<T> {
  promise: Promise<T>;
  cancel: () => void;
}

interface User {
  name: string;
  email: string;
  id: string;
  loginTime: string; // ISO date string
}

const exampleUser: User = {
  "name": "Firstname Lastname",
  "email": "email@address.com",
  "id": "GeneratedUserIdHash",
  "loginTime": "2021-09-03T09:36:34Z"
};


// **utils.ts**


export function fetchUserHistory(id): UserHistoryEvent[] {
  // call backend and return array of user history
  // example response returned here for the sake of the excersise:
  return Promise.resolve([
    {
      event: 'login',
      time: '2021-09-01T15:02:11Z',
    },
    {
      event: 'logout',
      time: '2021-09-01T17:30:52Z',
    },
    {
      event: 'login',
      time: '2021-09-03T09:36:34Z',
    },
  ]);
}

export function cancelablePromise<T>(promise: Promise<T>): CancelablePromise<T> {
  let isCanceled = false;
  const wrappedPromise = new Promise((resolve, reject) => {
    promise
      .then((val) => (isCanceled ? reject({ isCanceled }) : resolve(val)))
      .catch((error) => (isCanceled ? reject({ isCanceled }) : reject(error)));
  });
  return {
    promise: wrappedPromise,
    cancel: () => {
      isCanceled = true;
    },
  };
}


// **profileView.tsx**


import React from 'react'
import { cancelablePromise, fetchUserHistory } from './utils'
import { useHistory } from 'react-router'



interface UserHistoryEvent {
  event: 'login' | 'logout';
  time: string;
}

function trackPageView(page) {
  fetch('https://fake-tracking-api.com/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ page }),
  })// error handling?
}

export const ProfileView = (props: ProfileViewProps) => {
  const history = useHistory()
  const [time, setTime] = React.useState(Date.now())
  const [userHistory, setUserHistory] = React.useState<UserHistoryEvent[]>()

  React.useEffect(() => {
    trackPageView('user-profile-page')
  })

  React.useEffect(() => {
    setInterval(() => {
      setTime(Date.now())
    }, 1000)
    // no cleanup
  }, [])

  React.useEffect(() => {
    const cPromise = cancelablePromise(fetchUserHistory(props.user.id))
    cPromise.promise
      .then(response => {
        setUserHistory(response)
      })
      .catch(error => {
        // if not canceled
        console.log(error)
      })
      // cleanup on unmount
  }, [props.user.id])

  const elapsed_time = (time - props.user.loginTime) / 1000 / 60

  const logoutHandler = event => {
    event.preventDefault()
    props.backendLogout(props.user.id)
    history.push('/')
  }

  return (
    <article style={{
      display: 'flex',
      justifyContent: 'center',
      alignContent: 'center'
    }}>
      <div className="left-box">
        <h1>PROFILE</h1>
        <h4>name</h4>
        <p>{props.user.name}</p>
        <h4>email</h4>
        <p>{props.user.email}</p>
      </div>
      <div className="right-box">
        <p>You are logged in for: {elapsed_time} minutes</p>
        <button
          onClick={() => {
            props.backendLogout(props.user.id)
            history.push('/')
          }}
        >****
          LOGOUT
        </button>
      </div>
    </article>
    <div>
    {userHistory.map(({ event, time }) => (
      <li key={event}>
        {event} - {new Date(time).toLocaleDateString()}
      </li>
    ))}
  </div>
  )
}


export default ProfileView


