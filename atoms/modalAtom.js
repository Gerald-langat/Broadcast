import { atom } from "recoil";
export const modalStatus = atom({
  key: "modalStatus", // unique ID (with respect to other atoms/selectors)
  default: false, // default value (aka initial value)
});

export const modalMainStatus = atom({
  key: 'modalMainStatus',
  default: false,
});

export const modalMainStatusId = atom({
  key: 'modalMainStatusId',
  default: null,
});

export const modalState = atom({
  key: "modalState",
  default: false, 
});

export const modalCountyState = atom({
  key: "modalCountyState",
  default: false, 
});

export const modalWardState = atom({
  key: "modalWardState",
  default: false, 
});

export const modalConstituencyState = atom({
  key: "modalConstituencyState",
  default: false, 
});


export const postIdState = atom({
  key: "postIdState", // unique ID (with respect to other atoms/selectors)
  default: "id", // default value (aka initial value)
});

export const postIdStatus = atom({
  key: "anotherPostIdStatus", // unique ID (with respect to other atoms/selectors)
  default: "id", // default value (aka initial value)
});

export const postIdWard = atom({
  key: "anotherPostIdWard", // unique ID (with respect to other atoms/selectors)
  default: "id", // default value (aka initial value)
});


export const postIdConstituency = atom({
  key: "anotherPostIdConstituency", // unique ID (with respect to other atoms/selectors)
  default: "id", // default value (aka initial value)
});

export const postIdCounty = atom({
  key: "anotherPostIdCounty", // unique ID (with respect to other atoms/selectors)
  default: "id", // default value (aka initial value)
});

export const postIdMessage = atom({
  key: "postIdMessage", // unique ID (with respect to other atoms/selectors)
  default: "id", // default value (aka initial value)
});



