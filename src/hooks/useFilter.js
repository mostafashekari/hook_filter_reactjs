import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FormType from "../constants/FormType";

export const EQUAL_SIGN = "~";
export const AND_SIGN = "+";
export const ARRAY_SEPARATOR = "--";

function parseUrl(url) {
  return url
    ?.replace("?", "")
    ?.split(AND_SIGN)
    ?.filter((v) => v)
    ?.reduce((acc, cur) => {
      const [key, value] = cur.split(EQUAL_SIGN);
      return { ...acc, [key]: decodeURIComponent(value) };
    }, {});
}

function stringifyUrl(data) {
  if (data) {
    return Object.entries(data)
      ?.filter(([k, v]) => k && v)
      ?.reduce((acc, [key, val], idx) => {
        return `${acc}${
          idx === 0 ? "" : AND_SIGN
        }${key}${EQUAL_SIGN}${encodeURIComponent(val)}`;
      }, "?");
  }
}

function useFilter(formData) {
  const navigate = useNavigate();
  const location = useLocation();
  const [filterState, setFilterState] = useState(() =>
    parseUrl(location.search)
  );

  useEffect(() => {
    navigate(stringifyUrl(filterState));
  }, [filterState, navigate]);

  function onChange(e, name, type) {
    let value = e.target.value;
    if (type === FormType.CHECKBOX_GROUP) {
      value = e.target.checked
        ? [...(filterState[name] || "").split(ARRAY_SEPARATOR), value].join(
            ARRAY_SEPARATOR
          )
        : (filterState[name] || "")
            .split(ARRAY_SEPARATOR)
            .filter((v) => v !== value)
            .join(ARRAY_SEPARATOR);
    } else if (type === FormType.CHECKBOX) {
      value = e.target.checked ? value : "";
    }
    setFilterState((prev) => ({ ...prev, [name]: value }));
  }

  function onClear(name) {
    setFilterState((prev) => {
      const newState = { ...prev };
      delete newState[name];
      formData
        .filter((item) => item.parent === name)
        .forEach((item) => delete newState[item.name]);
      return newState;
    });
  }

  function onClearAll() {
    setFilterState({});
  }

  return { filterState, onChange, onClear, onClearAll };
}

export default useFilter;
