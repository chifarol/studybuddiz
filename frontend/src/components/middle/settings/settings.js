import React, { useEffect, useRef, useState } from "react";

import "./settings.css";
import { Spinner } from "../../loading-spinner/spinner";
import { getFilePath, imageUpload } from "../../utils";
import axios from "axios";

const Settings = () => {
  let userLocal = JSON.parse(sessionStorage.getItem("user"));
  let [loading, setLoading] = useState(true);
  let [updateLoading, setUpdateLoading] = useState(false);
  let bio = useRef("");
  let [tempPicture, setTempPicture] = useState({});
  let [picture, setPicture] = useState("");
  let [displayImg, setDisplayImg] = useState("");
  let [user, setUser] = useState({});
  useEffect(() => {
    const config = {
      headers: {
        "Content-Type": "application/json",
        auth: userLocal.token,
      },
    };
    axios
      .get(`/api/user?username=${userLocal.username}`, config)
      .then((res) => {
        console.log(res);
        setLoading(false);
        setUser(res.data.user);
      })
      .catch((e) => {
        setLoading(false);
        console.log(e);
      });
  }, []);

  /**
   *uploads user picture to cloudinary and updates user info in backend
   * @param string pictureUrl file path of new profile pictur.
   * @return string (hex color)
   */
  function uploadUser(pictureUrl = "") {
    const body = {};
    if (bio.current.value) {
      body.bio = bio.current.value;
    }
    if (pictureUrl) {
      body.picture = pictureUrl;
    }
    const config = {
      headers: {
        "Content-Type": "application/json",
        auth: userLocal.token,
      },
    };

    axios
      .post(`/api/user`, body, config)
      .then((res) => {
        setUpdateLoading(false);
        console.log(res.data.user);

        let newUser = res.data.user;
        newUser.token = userLocal.token;
        sessionStorage.setItem("user", JSON.stringify(newUser));
        window.location.reload();
      })
      .catch((e) => {
        setUpdateLoading(false);
        console.log(e);
      });
  }
  async function updateUser() {
    setUpdateLoading(true);
    if (tempPicture.name) {
      console.log("tempPicture", tempPicture);
      imageUpload(tempPicture, "user", userLocal.username)
        .then((res) => uploadUser(res))
        .catch((e) => {
          console.log(e);
          setUpdateLoading(false);
        });
    } else {
      uploadUser();
    }
  }
  return (
    <div className="settings-container">
      <div className="settings-form">
        {loading && (
          <div className="pos-relative center">
            <Spinner />
          </div>
        )}
        <div className="settings-field-picture-container pos-relative">
          <input
            type="file"
            id="image-input"
            className="hide"
            onChange={(e) => {
              setTempPicture(e.target.files[0]);
              setDisplayImg(getFilePath(e.target.files[0]));
            }}
          />

          <label
            htmlFor="image-input"
            className="settings-field-picture pos-absolute pointer"
          >
            <img src={displayImg || user.picture} crossOrigin="anonymous" />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="48"
              width="48"
              viewBox="0 0 48 48"
              className="settings-field-picture-edit"
            >
              <path d="M39.7 14.7 33.3 8.3 35.4 6.2Q36.25 5.35 37.525 5.375Q38.8 5.4 39.65 6.25L41.8 8.4Q42.65 9.25 42.65 10.5Q42.65 11.75 41.8 12.6ZM37.6 16.8 12.4 42H6V35.6L31.2 10.4Z" />
            </svg>
          </label>
        </div>
        <div className="settings-field">
          <span className="settings-label">BIO</span>
          <textarea defaultValue={user.bio} ref={bio}></textarea>
        </div>

        <div
          className="settings-submit pointer pos-relative"
          onClick={updateUser}
        >
          {updateLoading && <Spinner />}
          SAVE
        </div>
      </div>
    </div>
  );
};

export default Settings;
