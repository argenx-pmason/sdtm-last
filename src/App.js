import "./App.css";
import React, { useEffect, useState } from "react";
import local_rows from "./sdtm_for_studies.json";
import local_user_list from "./folder_access_request.json";
import local_study_people from "./study_people.json";
import local_super_users from "./super_users.json";
import {
  Box,
  Grid,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
  Link,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  Snackbar,
  DialogActions,
  Radio,
  FormControlLabel,
  RadioGroup,
  InputAdornment,
  Switch,
  Fade,
  Chip,
  // Autocomplete,
} from "@mui/material";
import {
  ArrowCircleUpTwoTone,
  CheckBoxOutlineBlank,
  Remove,
  Add,
  Save,
  AccountCircle,
  Visibility,
  Info,
  SearchTwoTone,
  FileCopyTwoTone,
  ViewComfy,
  EmailTwoTone,
  ViewCozy,
  Lock,
  ViewHeadline,
  ContentCopyTwoTone,
  Cancel,
  AccessAlarm,
  LockOpen,
  DirectionsRun,
  CheckBox,
} from "@mui/icons-material";
import {
  DataGridPro,
  // GridToolbar,
  useGridApiRef,
  GridToolbarExport,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarFilterButton,
} from "@mui/x-data-grid-pro";
import { getDir, xmlToJson } from "./utility";
import { LicenseInfo } from "@mui/x-license";
//TODO change imports to fetches, so we can update in PROD and see result in app
// import optionsForStatus from "./optionsForStatus";
// import optionsForPhase from "./optionsForPhase";
import fullIndication from "./fullIndication";
import useSound from "use-sound";
// import _chime from "./_chime.mp3";
import _saved from "./_saved.wav";
import _tobesaved from "./_tobesaved.wav";
import _error from "./_error.wav";

const App = () => {
  LicenseInfo.setLicenseKey(
    "6b1cacb920025860cc06bcaf75ee7a66Tz05NDY2MixFPTE3NTMyNTMxMDQwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI="
  );
  const urlPrefix = window.location.protocol + "//" + window.location.host,
    apiRef = useGridApiRef(),
    { href, origin } = window.location,
    mode = href.startsWith("http://localhost") ? "local" : "remote",
    server = href.split("//")[1].split("/")[0],
    webDavPrefix = urlPrefix + "/lsaf/webdav/repo",
    fileViewerPrefix = `https://${server}/lsaf/filedownload/sdd:/general/biostat/tools/fileviewer/index.html?file=`,
    logViewerPrefix = `https://${server}/lsaf/filedownload/sdd:/general/biostat/tools/logviewer/index.html?log=`,
    params = new URLSearchParams(document.location.search),
    innerHeight = window.innerHeight,
    title = "SDTM for studies",
    jsonPath = "/general/biostat/metadata/projects/sdtm_for_studies.json",
    // "/general/biostat/tools/sdtm-last/metadata/sdtm_for_studies.json",
    dataUrl = webDavPrefix + jsonPath,
    usersUrl =
      webDavPrefix +
      "/general/biostat/metadata/projects/folder_access_request.json",
    peopleUrl =
      webDavPrefix + "/general/biostat/metadata/projects/study_people.json",
    superUserUrl =
      webDavPrefix + "/general/biostat/metadata/projects/super_users.json",
    [rowsToUse, setRowsToUse] = useState([]),
    [originalRows, setOriginalRows] = useState([]),
    [showMessage, setShowMessage] = useState(null),
    [showGsdtmSwitch, setShowGsdtmSwitch] = useState(false),
    [quickFilterValues, setQuickFilterValues] = useState(null),
    [pathForThisRow, setPathForThisRow] = useState(""),
    // [showOngoingStudies, setShowOngoingStudies] = useState(true),
    // [filterModel, setFilterModel] = useState({ items: [] }),
    // options = [
    //   { label: "SDTM", value: "SDTM" },
    //   { label: "GSDTM", value: "GSDTM" },
    //   { label: "NONE", value: "NONE" },
    // ],
    [ready, setReady] = useState(false),
    saveUser = () => {
      localStorage.setItem("username", tempUsername);
      localStorage.setItem("userFullName", userFullName);
      setOpenUserLogin(false);
    },
    [tempUsername, setTempUsername] = useState(""),
    [userFullName, setUserFullName] = useState(
      localStorage.getItem("userFullName")
    ),
    [openUserLogin, setOpenUserLogin] = useState(false),
    [openSnackbar, setOpenSnackbar] = useState(false),
    [openSnackbar2, setOpenSnackbar2] = useState(false),
    [showSaveButton, setShowSaveButton] = useState(false),
    [userList, setUserList] = useState(null),
    [radioValue, setRadioValue] = useState("all"),
    [needToSave, setNeedToSave] = useState(false),
    [flash, setFlash] = useState(false),
    [selectedCompound, setSelectedCompound] = useState(""),
    [split, setSplit] = useState(false),
    [selected, setSelected] = useState(null),
    [studyPeople, setStudyPeople] = useState(null),
    [superUsers, setSuperUsers] = useState(null),
    [dialogType, setDialogType] = useState(null),
    parseCustomDateTime = (dateTimeStr) => {
      const months = {
        jan: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        may: 4,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        oct: 9,
        nov: 10,
        dec: 11,
      };
      dateTimeStr = dateTimeStr.trim(); // Remove spaces at either end of the string
      const day = parseInt(dateTimeStr.slice(0, 2), 10);
      const month = months[dateTimeStr.slice(2, 5).toLowerCase()];
      const year = parseInt(dateTimeStr.slice(5, 9), 10);
      const hour = parseInt(dateTimeStr.slice(10, 12), 10);
      const minute = parseInt(dateTimeStr.slice(13, 15), 10);
      const second = parseInt(dateTimeStr.slice(16, 18), 10);
      return new Date(year, month, day, hour, minute, second);
    },
    setComment = (value, sn) => {
      const ind = rowsToUse.findIndex((e) => e.studyname === sn);
      // console.log(
      //   "ind",
      //   ind,
      //   "sn",
      //   sn,
      //   "value",
      //   value,
      //   "rowsToUse[ind]",
      //   rowsToUse[ind]
      // );
      rowsToUse[ind].comments = value;
      // setNeedToSave(true);
    },
    StudyInfo = ({ study }) => {
      const thisStudy = rowsToUse.find((e) => e.studyname === study),
        {
          studyname,
          protocol_name,
          Last_Achieved_Milestone,
          FPFV,
          LPLV,
          adsl_refresh_date,
          eosdt,
          lstcndt,
          sdtm_ae_refresh_date,
          No_of_subjects_treated,
          studyid_add,
          Randomization_Quotient,
          Study_Name,
          comments,
        } = thisStudy,
        peopleStudy = studyPeople.find((e) => e.study === study),
        {
          most_active_programmer,
          lead_programmer,
          most_active_dm,
          lead_statistician,
        } = peopleStudy || {
          most_active_programmer: "unknown",
          lead_programmer: "unknown",
          most_active_dm: "unknown",
          lead_statistician: "unknown",
        },
        emailDM = most_active_dm.includes("(")
          ? most_active_dm.split("(")[1].split(")")[0] + "@argenx.com"
          : null;

      console.log(
        "thisStudy",
        thisStudy,
        "peopleStudy",
        peopleStudy,
        studyPeople,
        study,
        "emailDM",
        emailDM
      );
      return (
        <Box>
          <TextField
            sx={{ width: "90%", mt: 1 }}
            label="Additional Study ID"
            value={studyid_add}
          />
          <IconButton sx={{ width: "10%" }} onClick={() => setSplit(false)}>
            <Cancel />
          </IconButton>
          <TextField
            sx={{ width: "48%", mt: 1 }}
            label="SDTM AE Refresh"
            value={sdtm_ae_refresh_date}
          />
          <TextField
            sx={{ width: "48%", mt: 1 }}
            label="gADSL Refresh"
            value={adsl_refresh_date}
          />
          <TextField
            sx={{ width: "48%", mt: 1 }}
            label="Most Active Programmer"
            value={most_active_programmer}
          />
          <TextField
            sx={{ width: "48%", mt: 1 }}
            label="Lead Programmer"
            value={lead_programmer}
          />
          <TextField
            sx={{ width: "48%", mt: 1 }}
            label="Lead Statistician"
            value={lead_statistician}
          />{" "}
          <Tooltip title={"Email a Data Manager"}>
            <TextField
              sx={{
                width: "48%",
                mt: 1,
                color: "primary",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "lightyellow",
                },
                input: { color: "blue" },
              }}
              label="Most Active DM"
              value={most_active_dm}
              onClick={() => {
                window.open(
                  `mailto:${emailDM}?subject=Question about ${studyname}&body=This email was sent from: ` +
                    encodeURIComponent(href) +
                    "%0D%0A%0D%0AMy question is:",
                  "_blank"
                );
              }}
            />
          </Tooltip>
          <TextField
            sx={{ width: "85%", mt: 1, input: { color: "green" } }}
            label="Comments"
            color="success"
            variant="standard"
            defaultValue={comments}
            // value={comments}
            onChange={(e) => {
              setComment(e.target.value, studyname);
            }}
            multiline
            maxRows={6}
          />
          <Tooltip title="Save changes">
            <IconButton
              sx={{ mt: 3 }}
              onClick={() => saveChanges(dataUrl, rowsToUse)}
            >
              <Save />
            </IconButton>
          </Tooltip>
          <TextField
            sx={{ width: "48%", mt: 1 }}
            label="Last achieved milestone"
            value={Last_Achieved_Milestone}
          />
          <TextField
            sx={{ width: "48%", mt: 1 }}
            label="Study name"
            value={Study_Name}
          />
          <TextField
            sx={{ width: "48%", mt: 1 }}
            label="First Patient First Visit"
            value={FPFV}
          />
          <TextField
            sx={{ width: "48%", mt: 1 }}
            label="Last Patient Last Visit"
            value={LPLV}
          />
          <TextField
            sx={{ width: "48%", mt: 1 }}
            label="End of Study"
            value={eosdt}
          />
          <TextField
            sx={{ width: "48%", mt: 1 }}
            label="Last Contact?"
            value={lstcndt}
          />
          {/* <TextField
            sx={{ width: "48%", mt: 1 }}
            label="First ICF"
            value={First_ICF_date}
          /> */}
          {/* <TextField
            sx={{ width: "48%", mt: 1 }}
            label="Control Type"
            value={Control_Type}
          /> */}
          {/* <TextField
            sx={{ width: "48%", mt: 1 }}
            label="Investigational Treatment"
            value={Investigational_Treatment}
          /> */}
          <TextField
            sx={{ width: "48%", mt: 1 }}
            label="Subjects treated"
            value={No_of_subjects_treated}
          />
          <TextField
            sx={{ width: "48%", mt: 1 }}
            label="Randomization Quotient"
            value={Randomization_Quotient}
          />
          <TextField
            sx={{ width: "100%", mt: 1 }}
            label="Protocol name"
            value={protocol_name}
            multiline
            maxRows={6}
          />
        </Box>
      );
    },
    // [chime] = useSound(_chime, { volume: 0.25 }),
    [error] = useSound(_error, { volume: 0.75 }),
    [saved] = useSound(_saved, { volume: 0.25 }),
    [tobesaved] = useSound(_tobesaved, {
      volume: 0.25,
      sprite: { bit: [0, 1400] },
    }),
    CustomToolbar = () => {
      return (
        <GridToolbarContainer>
          <GridToolbarFilterButton />
          <GridToolbarExport />
          <RadioGroup
            name="radio1"
            value={radioValue}
            row
            onChange={(e) => {
              setRadioValue(e.target.value);
              const f = apiRef.current,
                model = f.state.filter.filterModel,
                filter =
                  e.target.value === "notfinal"
                    ? [
                        {
                          field: "status",
                          operator: "doesNotEqual",
                          value: "final",
                          id: 1,
                        },
                      ]
                    : e.target.value === "ongoing"
                    ? [
                        {
                          field: "status",
                          operator: "equals",
                          value: "ongoing",
                          id: 1,
                        },
                      ]
                    : e.target.value === "all"
                    ? [
                        {
                          field: "status",
                          operator: "equals",
                          value: "",
                          id: 1,
                        },
                      ]
                    : [];
              console.log("f", f, "model", model, "filter", filter);
              apiRef.current.upsertFilterItems(filter);
            }}
          >
            <FormControlLabel
              value="ongoing"
              control={<Radio />}
              label="Ongoing"
            />
            <FormControlLabel
              value="notfinal"
              control={<Radio />}
              label="Not Final"
            />
            <FormControlLabel value="all" control={<Radio />} label="All" />
          </RadioGroup>
          <Tooltip title="Compound argx-110">
            <Button
              variant={selectedCompound === "110" ? "contained" : "outlined"}
              onClick={() => {
                setSelectedCompound("110");
                const f = apiRef.current,
                  model = f.state.filter.filterModel,
                  currentFilter = apiRef.current.state.filter.filterModel.items,
                  newFilter = [
                    ...currentFilter,
                    {
                      field: "compound",
                      operator: "equals",
                      value: "argx-110",
                      id: 2,
                    },
                  ];
                console.log(
                  "f",
                  f,
                  "model",
                  model,
                  "currentFilter",
                  currentFilter,
                  "newFilter",
                  newFilter
                );
                apiRef.current.upsertFilterItems(newFilter);
              }}
              sx={{ m: 1, fontSize: fontSize, height: fontSize + 3 }}
              color="info"
            >
              110
            </Button>
          </Tooltip>
          <Tooltip title="Compound argx-113">
            <Button
              variant={selectedCompound === "113" ? "contained" : "outlined"}
              onClick={() => {
                setSelectedCompound("113");
                const f = apiRef.current,
                  model = f.state.filter.filterModel,
                  currentFilter = apiRef.current.state.filter.filterModel.items,
                  newFilter = [
                    ...currentFilter,
                    {
                      field: "compound",
                      operator: "equals",
                      value: "argx-113",
                      id: 2,
                    },
                  ];
                console.log(
                  "f",
                  f,
                  "model",
                  model,
                  "currentFilter",
                  currentFilter,
                  "newFilter",
                  newFilter
                );
                apiRef.current.upsertFilterItems(newFilter);
              }}
              sx={{ m: 1, fontSize: fontSize, height: fontSize + 3 }}
              color="info"
            >
              113
            </Button>
          </Tooltip>
          <Tooltip title="Compound argx-117">
            <Button
              variant={selectedCompound === "117" ? "contained" : "outlined"}
              onClick={() => {
                setSelectedCompound("117");
                const f = apiRef.current,
                  model = f.state.filter.filterModel,
                  currentFilter = apiRef.current.state.filter.filterModel.items,
                  newFilter = [
                    ...currentFilter,
                    {
                      field: "compound",
                      operator: "equals",
                      value: "argx-117",
                      id: 2,
                    },
                  ];
                console.log(
                  "f",
                  f,
                  "model",
                  model,
                  "currentFilter",
                  currentFilter,
                  "newFilter",
                  newFilter
                );
                apiRef.current.upsertFilterItems(newFilter);
              }}
              sx={{ m: 1, fontSize: fontSize, height: fontSize + 3 }}
              color="info"
            >
              117
            </Button>
          </Tooltip>
          <Tooltip title="Compound argx-119">
            <Button
              variant={selectedCompound === "119" ? "contained" : "outlined"}
              onClick={() => {
                setSelectedCompound("119");
                const f = apiRef.current,
                  model = f.state.filter.filterModel,
                  currentFilter = apiRef.current.state.filter.filterModel.items,
                  newFilter = [
                    ...currentFilter,
                    {
                      field: "compound",
                      operator: "equals",
                      value: "argx-119",
                      id: 2,
                    },
                  ];
                console.log(
                  "f",
                  f,
                  "model",
                  model,
                  "currentFilter",
                  currentFilter,
                  "newFilter",
                  newFilter
                );
                apiRef.current.upsertFilterItems(newFilter);
              }}
              sx={{ m: 1, fontSize: fontSize, height: fontSize + 3 }}
              color="info"
            >
              119
            </Button>
          </Tooltip>{" "}
          <Tooltip title="All Compounds">
            <Button
              variant={selectedCompound === "" ? "contained" : "outlined"}
              onClick={() => {
                setSelectedCompound("");
                const f = apiRef.current,
                  model = f.state.filter.filterModel,
                  currentFilter = apiRef.current.state.filter.filterModel.items,
                  newFilter = [
                    ...currentFilter,
                    {
                      field: "compound",
                      operator: "equals",
                      value: "",
                      id: 2,
                    },
                  ];
                console.log(
                  "f",
                  f,
                  "model",
                  model,
                  "currentFilter",
                  currentFilter,
                  "newFilter",
                  newFilter
                );
                apiRef.current.upsertFilterItems(newFilter);
              }}
              sx={{ m: 1, fontSize: fontSize, height: fontSize + 3 }}
              color="info"
            >
              All
            </Button>
          </Tooltip>
          {/* <Tooltip title="Clear filters to show all data">
            <Button
              color="info"
              variant="outlined"
              size="small"
              key={"clear"}
              sx={{ m: 1, fontSize: fontSize, height: fontSize + 3 }}
              onClick={(e) => {
                apiRef.current.upsertFilterItems([]);
              }}
            >
              Clear
            </Button>
          </Tooltip> */}
          <Box sx={{ flexGrow: 1 }} />
          <GridToolbarQuickFilter />
        </GridToolbarContainer>
      );
    },
    handleCloseSnackbar = (event, reason) => {
      if (reason === "clickaway") {
        return;
      }
      setOpenSnackbar(false);
    },
    handleCloseSnackbar2 = (event, reason) => {
      if (reason === "clickaway") {
        return;
      }
      setOpenSnackbar2(false);
    },
    cols = [
      {
        field: "compound",
        headerName: "Compound",
        renderCell: (cellValues) => {
          const { value, row } = cellValues,
            {
              new_study,
              visibleFlag,
              days_since_last_ae_refresh,
              // path,
              // && !(path.includes(".zip")
              status,
            } = row;
          return (
            <Tooltip
              title={
                "Days since last AE refresh: " + days_since_last_ae_refresh
              }
            >
              <Box
                sx={{
                  backgroundColor:
                    visibleFlag === "N"
                      ? "black"
                      : new_study === "Y"
                      ? "#e6ffe6"
                      : days_since_last_ae_refresh > 28 && status !== "final"
                      ? "#fff5e6"
                      : null,
                  color: visibleFlag === "N" ? "white" : "black",
                }}
              >
                {value}
              </Box>
            </Tooltip>
          );
        },
      },
      {
        field: "indication",
        headerName: "Indication",
        renderCell: (cellValues) => {
          const { value, row } = cellValues,
            {
              new_study,
              visibleFlag,
              days_since_last_ae_refresh,
              // path,
              // && !(path.includes(".zip")
              status,
            } = row;
          return (
            <Tooltip
              title={value in fullIndication ? fullIndication[value] : value}
            >
              <Box
                sx={{
                  backgroundColor:
                    visibleFlag === "N"
                      ? "black"
                      : new_study === "Y"
                      ? "#e6ffe6"
                      : days_since_last_ae_refresh > 28 && status !== "final"
                      ? "#fff5e6"
                      : null,
                  color: visibleFlag === "N" ? "white" : "black",
                }}
              >
                {value}
              </Box>
            </Tooltip>
          );
        },
      },
      {
        field: "studyname",
        headerName: "Study",
        width: 160,
        renderCell: (cellValues) => {
          const { value, row } = cellValues,
            {
              comments,
              new_study,
              visibleFlag,
              days_since_last_ae_refresh,
              // path,
              // && !(path.includes(".zip")
              status,
            } = row,
            commentText = comments ? ` - ${comments}` : "",
            color = comments ? "blue" : "black";
          // console.log(row, comments, commentText, color);
          return (
            <Tooltip title={`Click4More${commentText}`}>
              <Button
                size="small"
                sx={{
                  fontSize: fontSize,
                  backgroundColor:
                    visibleFlag === "N"
                      ? "black"
                      : new_study === "Y"
                      ? "#e6ffe6"
                      : days_since_last_ae_refresh > 28 && status !== "final"
                      ? "#fff5e6"
                      : null,
                  color: visibleFlag === "N" ? "white" : color,
                }}
                onClick={() => {
                  setSplit(true);
                  console.log(value);
                  setSelected(value);
                }}
              >
                {value}
              </Button>
            </Tooltip>
          );
        },
      },
      {
        field: "status",
        headerName: "Status",
        width: 100,
        renderCell: (cellValues) => {
          const { value, row } = cellValues,
            { lstcndt, eosdt } = row;
          return (
            <Tooltip
              title={
                "Last contact date: " +
                lstcndt +
                ",   " +
                "End of study date: " +
                eosdt
              }
            >
              <Box>{value}</Box>
            </Tooltip>
          );
          // return String(age).padStart(4, "0");
        },
      },
      {
        field: "gsdtmflag",
        editable: true,
        headerName: "gSDTM?",
        width: 90,
        renderCell: (cellValues) => {
          const { value, row } = cellValues,
            { id } = row;
          return (
            <Switch
              sx={{
                fontSize: fontSize - 5,
                // border: 0.1,
                // padding: 0.5,
                // mt: 0.1,
                transform: "scale(0.75)",
              }}
              checked={value || value === 1 || value === "Y" ? true : false}
              onChange={(event) => {
                const checked = event.target.checked;
                console.log("id", id, "value", value, checked);
                setSelectedId(id);
                setNeedToSave(true);
                handleSwitch(checked, id);
              }}
              disabled={!showGsdtmSwitch}
            />
          );
        },
        // type: "singleSelect",
        // valueOptions: options,
      },
      {
        field: "path",
        editable: true,
        headerName: "Path",
        flex: 1,
        renderCell: (cellValues) => {
          const { value, row } = cellValues,
            pathArray = value.split("/"),
            { id, gsdtmflag, needsCopy } = row,
            lastPart = pathArray.slice(5).join("/");
          if (gsdtmflag) return <Box></Box>;
          else if (value === "Manual")
            return (
              <Tooltip title="Manual copying">
                <Chip
                  label="Manual"
                  size="small"
                  color="primary"
                  onClick={() => {
                    console.log("id", id);
                    setSelectedId(id);
                    setDialogType("last");
                    handleClick(value, id, "last");
                  }}
                />
              </Tooltip>
            );
          else if (lastPart.length > 0)
            return (
              <Tooltip
                title={
                  needsCopy === "Y" ? "will be copied" : "click to choose path"
                }
              >
                <Box
                  sx={{
                    textDecoration: "underline",
                    cursor: "pointer",
                    backgroundColor: needsCopy === "Y" ? "#e6ffe6" : null,
                    color: "blue",
                  }}
                  onClick={() => {
                    console.log("id", id);
                    setSelectedId(id);
                    setDialogType("last");
                    handleClick(value, id, "last");
                  }}
                >
                  {lastPart}
                </Box>
              </Tooltip>
            );
          else
            return (
              <Button
                sx={{
                  fontSize: fontSize,
                  border: 0.1,
                  padding: 0.5,
                  mt: 0.5,
                  height: fontSize + 4,
                }}
                onClick={() => {
                  console.log("id", id);
                  setSelectedId(id);
                  setDialogType("last");
                  handleClick(value, id, "last");
                }}
              >
                Choose path
              </Button>
            );
        },
      },

      {
        field: "id",
        headerName: "Actions",
        width: 180,
        renderCell: (cellValues) => {
          const { row } = cellValues,
            { path, path_locked, id, compound, indication, studyname, status } =
              row,
            default_path_locked =
              "/clinical/" +
              compound +
              "/" +
              indication +
              "/" +
              studyname +
              "/dm/production",
            color =
              path_locked === default_path_locked || path_locked === ""
                ? "info"
                : status === "final" && path !== path_locked
                ? "error"
                : "success",
            title =
              path_locked === default_path_locked
                ? "Click to select locked SDTM file"
                : status === "final" && path !== path_locked
                ? "Usually the locked and last SDTM would be the same when study is final"
                : path_locked === ""
                ? "Path locked is blank"
                : path_locked,
            pathToPass = path_locked === "" ? default_path_locked : path_locked;
          return (
            <>
              <Tooltip title={title}>
                <IconButton
                  onClick={() => {
                    console.log(
                      "studyname",
                      studyname,
                      "id",
                      id,
                      "path_locked",
                      path_locked,
                      "pathToPass",
                      pathToPass
                    );
                    setSelectedId(id);
                    setDialogType("locked");
                    handleClick(pathToPass, id, "locked");
                  }}
                  color={color}
                >
                  {color === "success" ? (
                    <Lock
                      sx={{
                        "&:hover": { cursor: "pointer" },
                        transparency: 0.5,
                        fontSize: fontSize + 3,
                      }}
                    />
                  ) : (
                    <LockOpen
                      sx={{
                        "&:hover": { cursor: "pointer" },
                        transparency: 0.5,
                        fontSize: fontSize + 3,
                      }}
                    />
                  )}{" "}
                </IconButton>
              </Tooltip>
              <Tooltip title="View the file or path currently selected">
                <IconButton
                  onClick={() => {
                    window.open(`${fileViewerPrefix}${path}`, "_blank").focus();
                  }}
                >
                  <FileCopyTwoTone
                    sx={{
                      "&:hover": { cursor: "pointer" },
                      fontSize: fontSize + 3,
                    }}
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title="View sdtm_last for this study">
                <IconButton
                  onClick={() => {
                    window
                      .open(
                        `${fileViewerPrefix}/clinical/${compound}/${indication}/${studyname}/biostat/staging/data_received/sdtm_last`,
                        "_blank"
                      )
                      .focus();
                  }}
                >
                  <ContentCopyTwoTone
                    sx={{
                      "&:hover": { cursor: "pointer" },
                      fontSize: fontSize + 3,
                    }}
                  />
                </IconButton>
              </Tooltip>
              <Tooltip title="View gSDTM log in log viewer">
                <IconButton
                  onClick={() => {
                    window
                      .open(
                        `${logViewerPrefix}/clinical/${compound}/${indication}/${studyname}/dm/g_sdtm/current/2_jobs/logs/cj_mapping_engine.log`,
                        "_blank"
                      )
                      .focus();
                  }}
                  disabled={!showGsdtmSwitch}
                >
                  <ViewComfy
                    sx={{
                      "&:hover": { cursor: "pointer" },
                      fontSize: fontSize + 3,
                    }}
                  />
                </IconButton>
              </Tooltip>
            </>
          );
        },
      },

      // {
      //   field: "dateFirstVisible",
      //   headerName: "Age",
      //   width: 50,
      //   renderCell: (cellValues) => {
      //     const { value } = cellValues,
      //       d = new Date(value),
      //       age = parseInt((new Date() - d) / (24 * 3600 * 1000));
      //     return <Box>{age.toLocaleString()}</Box>;
      //   },
      // },
      // {
      //   field: "dateLastVisible",
      //   headerName: "Last visible",
      //   renderCell: (cellValues) => {
      //     const { value, row } = cellValues,
      //       { visibleFlag } = row;
      //     return (
      //       <Box
      //         sx={{
      //           backgroundColor: visibleFlag === "N" ? "black" : null,
      //           color: visibleFlag === "N" ? "white" : "black",
      //         }}
      //       >
      //         {value}
      //       </Box>
      //     );
      //   },
      // },
      // { field: "needsCopy", headerName: "To Copy", width: 70 },
      {
        field: "datecopied",
        headerName: "Date Copied",
        width: 150,
        type: "dateTime",
        valueGetter: (value) => {
          if (!value) {
            return value;
          }
          // create date object from datetime string, e.g. 12NOV2024:13:30:24
          const datetime = parseCustomDateTime(value);
          return datetime;
        },
        valueFormatter: (value) => {
          if (!value) {
            return value;
          }
          const show = value.toLocaleString([], {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          return show;
        },
        renderCell: (cellValues) => {
          const { value, row } = cellValues,
            { username, userFullName, visibleFlag } = row,
            show =
              visibleFlag === "N"
                ? ""
                : value.toLocaleString([], {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
          return (
            <Tooltip
              title={
                username
                  ? "copied by " + userFullName + " (" + username + ")"
                  : "null"
              }
            >
              <Box>{show}</Box>
            </Tooltip>
          );
        },
      },
      {
        field: "statusoflastcopy",
        headerName: "OK?",
        width: 90,
        renderCell: (cellValues) => {
          const { value, row } = cellValues,
            { visibleFlag } = row,
            show = visibleFlag === "N" ? "" : value;
          return (
            <Box
              sx={{
                backgroundColor:
                  visibleFlag === "N"
                    ? null
                    : value === "Passed"
                    ? "#e6ffe6"
                    : "#ffe6e6",
                // color: visibleFlag === "N" ? "white" : "black",
              }}
            >
              {show}
            </Box>
          );
        },
      },
    ],
    [fontSize, setFontSize] = useState(
      Number(localStorage.getItem("fontSize")) || 10
    ),
    // columns used in popup letting users pick zip files
    fileCols = [
      {
        field: "label",
        headerName: "name",
        flex: 1,
        renderCell: (cellValues) => {
          const { row, value } = cellValues,
            { isDirectory, value: zipPath } = row,
            url = row.value,
            path =
              url.indexOf("/repo/") > 0
                ? url.slice(url.indexOf("/repo/") + 5)
                : value,
            backgroundColor =
              zipPath &&
              zipPath.includes(pathForThisRow) &&
              pathForThisRow.includes(".zip")
                ? "yellow"
                : null;
          // console.log("url", url, "path", path);
          let cell;
          if (isDirectory)
            cell = (
              <Tooltip title={path}>
                <Link
                  onClick={() => {
                    console.log("path", path, "value", value);
                    handleClick(path, null, "last");
                  }}
                  href="#"
                  underline="hover"
                >
                  {value}
                </Link>
              </Tooltip>
            );
          else
            cell = (
              <Tooltip title={path}>
                <Box sx={{ color: "black", backgroundColor: backgroundColor }}>
                  {value}
                </Box>
              </Tooltip>
            );
          return cell;
        },
      },
      {
        field: "fileType",
        headerName: "Use",
        width: 50,
        renderCell: (cellValues) => {
          const { row } = cellValues,
            { value, label } = row,
            path =
              value.indexOf("/repo/") > 0
                ? value.slice(value.indexOf("/repo/") + 5)
                : value,
            name = label.split(" ")[0],
            zipForThisRow = pathForThisRow.split("/").at(-1),
            match = name && name.includes(".zip") && zipForThisRow === name,
            icon = match ? <CheckBox /> : <CheckBoxOutlineBlank />;
          if (value.endsWith(".zip"))
            return (
              <IconButton
                onClick={() => {
                  console.log(
                    "Use button pressed: ",
                    "path",
                    path,
                    "value",
                    value,
                    "row",
                    row
                  );
                  setSelectedPath(path);
                  setNeedsCopy("Y");
                  setNeedToSave(true);
                  setOpenWebdav(false);
                }}
                color={"info"}
                size="small"
                sx={{ mr: 1, height: fontSize + 3, fontSize: fontSize }}
              >
                {icon}
              </IconButton>
            );
          else return null;
        },
      },
      {
        field: "version",
        headerName: "FV",
        width: 50,
        renderCell: (cellValues) => {
          const { row } = cellValues,
            { value } = row,
            path =
              value.indexOf("/repo/") > 0
                ? value.slice(value.indexOf("/repo/") + 5)
                : value;
          return (
            <IconButton
              onClick={() => {
                console.log(
                  "FV button pressed: ",
                  "path",
                  path,
                  "value",
                  value,
                  "row",
                  row
                );
                window.open(`${fileViewerPrefix}${path}`, "_blank").focus();
              }}
              color={"info"}
              size="small"
              sx={{ mr: 1, height: fontSize + 3, fontSize: fontSize }}
            >
              <SearchTwoTone />
            </IconButton>
          );
        },
      },
      { field: "created", headerName: "created", width: 200 },
      { field: "modified", headerName: "modified", width: 200 },
      {
        field: "value",
        headerName: "path",
        flex: 3,
        renderCell: (cellValues) => {
          const { value, row } = cellValues,
            { isDirectory } = row,
            path =
              value.indexOf("/repo/") > 0
                ? value.slice(value.indexOf("/repo/") + 5)
                : value,
            backgroundColor =
              value.includes(pathForThisRow) && pathForThisRow.includes(".zip")
                ? "yellow"
                : null;
          let cell;
          if (isDirectory) cell = <Box sx={{ color: "blue" }}>{path}</Box>;
          else
            cell = (
              <Box sx={{ color: "black", backgroundColor: backgroundColor }}>
                {path}
              </Box>
            );
          return cell;
        },
      },
    ],
    // columns used in popup letting users pick zip files
    fileColsLocked = [
      {
        field: "label",
        headerName: "name",
        flex: 1,
        renderCell: (cellValues) => {
          const { row, value } = cellValues,
            { isDirectory } = row,
            url = row.value,
            path =
              url.indexOf("/repo/") > 0
                ? url.slice(url.indexOf("/repo/") + 5)
                : value;
          // console.log("url", url, "path", path);
          let cell;
          if (isDirectory)
            cell = (
              <Tooltip title={path}>
                <Link
                  onClick={() => {
                    console.log("path", path, "value", value);
                    handleClick(path, null, "locked");
                  }}
                  href="#"
                  underline="hover"
                >
                  {value}
                </Link>
              </Tooltip>
            );
          else
            cell = (
              <Tooltip title={path}>
                <Box sx={{ color: "black" }}>{value}</Box>
              </Tooltip>
            );
          return cell;
        },
      },
      { field: "created", headerName: "created", width: 200 },
      { field: "modified", headerName: "modified", width: 200 },
      {
        field: "value",
        headerName: "path",
        flex: 3,
        renderCell: (cellValues) => {
          const { value, row } = cellValues,
            { isDirectory } = row,
            path =
              value.indexOf("/repo/") > 0
                ? value.slice(value.indexOf("/repo/") + 5)
                : value;
          let cell;
          if (isDirectory) cell = <Box sx={{ color: "blue" }}>{path}</Box>;
          else cell = <Box sx={{ color: "black" }}>{path}</Box>;
          return cell;
        },
      },
    ],
    [selectedId, setSelectedId] = useState(null),
    handleClick = (path, id, dt) => {
      let pathArray = path.split("/").filter((e, ind) => ind === 0 || e),
        fid = rowsToUse.findIndex((e) => e.id === id);
      console.log(
        "handleClick - id",
        id,
        "fid",
        fid,
        "rowsToUse",
        rowsToUse,
        "path",
        path,
        "pathArray",
        pathArray,
        "dt",
        dt
      );
      let pathToUse;
      const row = rowsToUse[fid],
        compound = row?.compound || pathArray[2],
        indication = row?.indication || pathArray[3],
        studyname = row?.studyname || pathArray[4],
        tempPath = row?.path;
      if (tempPath) setPathForThisRow(tempPath);
      console.log(
        "row",
        row,
        "compound",
        compound,
        "indication",
        indication,
        "studyname",
        studyname,
        "tempPath",
        tempPath
      );
      if (dt === "locked" && pathArray.length < 7) {
        pathToUse = path + "/production";
      } else if (
        (!path.includes(".zip") &&
          path.includes("/dm/staging/transfers") &&
          pathArray.length > 7) ||
        (path.includes("/dm/production") && pathArray.length > 6)
      ) {
        pathToUse = path;
      } else
        pathToUse = `/clinical/${compound}/${indication}/${studyname}/dm/staging/transfers`;
      //TODO: if path has a .zip at the end, then remove the last part so we just lookup the dir
      setCurrentDir(pathToUse);
      const tempParent = pathToUse.split("/").slice(0, -1).join("/");
      setParentDir(tempParent);
      // if (pathArray.length < 5) {
      //   pathToUse = `/clinical/${compound}/${indication}/${studyname}/dm/staging/transfers`;
      // } else if (pathArray.length > 8) {
      //     pathToUse = pathArray.slice(0, -1).join("/");
      // } else if (pathArray.length > 5) {
      //   pathToUse = pathArray.slice(0, 5).join("/") + "/dm/staging/transfers";
      // } else if (pathArray.length === 5 && id !== -99) {
      //   pathToUse = path + "/dm/staging/transfers";
      // }
      if (dt === "locked") setOpenWebdavLocked(true);
      else setOpenWebdav(true);
      if (id) setSelectedId(id);
      console.log("pathToUse", pathToUse, "id", id);
      getWebDav(pathToUse);
    },
    handleSwitch = (value, id) => {
      if (id) setSelectedId(id);
      console.log("handleSwitch - value", value, "id", id);
      const ind = rowsToUse.findIndex((e) => e.id === id);
      console.log("handleSwitch - id", id, "ind", ind, "value", value);
      rowsToUse[ind].gsdtmflag = value;
      if (value || value === 1 || value === "Y") rowsToUse[ind].path = "";
      console.log("handleSwitch - rowsToUse[ind]", rowsToUse[ind]);
    },
    chooseManual = (id) => {
      console.log("chooseManual - id", id);
      setNeedToSave(true);
      setSelectedPath("Manual");
      setNeedsCopy(null);
      handleSwitch(false, id);
      setOpenWebdav(false);
    },
    [selectedPath, setSelectedPath] = useState(null),
    [selectedPathLocked, setSelectedPathLocked] = useState(null),
    [needsCopy, setNeedsCopy] = useState(null),
    [listOfFiles, setListOfFiles] = useState([{ value: "topDir", id: 0 }]),
    [currentDir, setCurrentDir] = useState(""),
    [parentDir, setParentDir] = useState(""),
    [openWebdav, setOpenWebdav] = useState(false),
    [openWebdavLocked, setOpenWebdavLocked] = useState(false),
    [message, setMessage] = useState(null),
    updateJsonFile = (file, content) => {
      console.log("updateJsonFile - file:", file, "content:", content);
      setNeedToSave(false);
      setFlash(false);
      if (!file || !content) return;
      // drop id from each row in content
      const contentWithoutId = content.map((c) => {
        // delete c.id;
        return c;
      });
      let tempContent;
      // handle inserting table into the right place in keyed object
      tempContent = JSON.stringify(contentWithoutId);
      // try to delete the file, in case it is there already, otherwise the PUT will not work
      fetch(file, {
        method: "DELETE",
      })
        .then((response) => {
          fetch(file, {
            method: "PUT",
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
            body: tempContent,
          })
            .then((response) => {
              setMessage(response.ok ? "File saved" : "File not saved");
              setOpenSnackbar(true);
              if (response.ok) saved();
              else error();
              response.text().then(function (text) {
                console.log("text", text);
              });
            })
            .catch((err) => {
              setMessage(err);
              setOpenSnackbar(true);
              error();
              console.log("PUT err: ", err);
            });
        })
        .catch((err) => {
          setMessage(
            "DELETE was attempted before the new version was saved - but the DELETE failed. (see console)"
          );
          setOpenSnackbar(true);
          error();
          console.log("DELETE err: ", err);
        });
    },
    saveChanges = (dataUrl, rows) => {
      let write = false;
      rows.forEach((rowFromTable, currentId) => {
        const id = originalRows.findIndex((r) => r.id === rowFromTable.id),
          originalRow = originalRows[id];
        let writeRow = false;
        // was gSDTM flag changed?
        if (originalRow.gsdtmflag !== rowFromTable.gsdtmflag) {
          console.log(
            "gsdtmflag changed to: ",
            rowFromTable.gsdtmflag,
            ", from: ",
            originalRow.gsdtmflag
          );
          write = true;
          writeRow = true;
        }
        // was path changed?
        if (originalRow.path !== rowFromTable.path) {
          console.log(
            "path changed to: ",
            rowFromTable.path,
            ", from: ",
            originalRow.path
          );
          write = true;
          writeRow = true;
        }
        // was comments changed?
        if (originalRow?.comments !== rowFromTable?.comments) {
          console.log(
            "comments changed to: ",
            rowFromTable?.comments,
            ", from: ",
            originalRow?.comments
          );
          write = true;
          writeRow = true;
        }
        // ensure if path does not start with /clinical, then we dont copy
        if (!rowFromTable.path.startsWith("/clinical")) {
          rowFromTable.needsCopy = "N";
        }
        if (writeRow) {
          rowFromTable.userFullName = userFullName;
          rowFromTable.username = tempUsername;
          rowFromTable.changed = new Date().toISOString();
        }
      });
      if (write) updateJsonFile(dataUrl, rowsToUse);
    },
    [openInfo, setOpenInfo] = useState(false),
    getWebDav = async (dir) => {
      console.log("dir", dir, "mode", mode);
      if (mode === "local") {
        setListOfFiles([
          {
            value:
              origin + "/lsaf/webdav/repo/clinical/argx-110/aml/argx-110-0000/",
            fileType: "/lsaf/webdav/repo/clinical/argx-110/aml/argx-110-0000/",
            label: "argx-110-0000",
            created: "2021-08-11T06:22:30Z",
            modified: "Fri, 22 Apr 2022 13:49:21 GMT",
            checkedOut: "No",
            locked: "No",
            version: null,
            isDirectory: true,
            id: 0,
          },
          {
            value:
              origin +
              "/lsaf/webdav/repo/clinical/argx-110/aml/argx-110-0000/biostat/",
            fileType:
              "/lsaf/webdav/repo/clinical/argx-110/aml/argx-110-0000/biostat/",
            label: "biostat",
            created: "2021-08-11T06:22:30Z",
            modified: "Fri, 22 Apr 2022 15:55:53 GMT",
            checkedOut: "No",
            locked: "No",
            version: null,
            isDirectory: true,
            id: 1,
          },
          {
            value:
              origin +
              "/lsaf/webdav/repo/clinical/argx-110/aml/argx-110-0000/dm/",
            fileType:
              "/lsaf/webdav/repo/clinical/argx-110/aml/argx-110-0000/dm/",
            label: "dm",
            created: "2021-08-11T06:22:31Z",
            modified: "Fri, 22 Apr 2022 15:55:52 GMT",
            checkedOut: "No",
            locked: "No",
            version: null,
            isDirectory: true,
            id: 2,
          },
          {
            value:
              origin +
              "/lsaf/webdav/repo/clinical/argx-113/cidp/argx-113-1902/dm/staging/transfers/2021-07-06_argx-113-1902_sdtm.zip",
            fileType:
              "/lsaf/webdav/repo/clinical/argx-113/cidp/argx-113-1902/dm/staging/transfers/2021-07-06_argx-113-1902_sdtm.zip",
            label: "2021-07-06_argx-113-1902_sdtm.zip",
            created: "2021-08-11T06:22:31Z",
            modified: "Fri, 22 Apr 2022 15:55:52 GMT",
            checkedOut: "No",
            locked: "No",
            version: null,
            isDirectory: false,
            id: 3,
          },
        ]);
      } else await getDir(webDavPrefix + dir, 1, processXml, processError);
    },
    [validDir, setValidDir] = useState(true),
    processError = (response) => {
      console.log("processError", response);
      setShowMessage(
        "Error: " + response.status === 404 ? "Not found" : response.statusText
      );
      error();
      setOpenSnackbar2(true);
      setOpenWebdavLocked(false);
      setValidDir(false);
    },
    processXml = (responseXML) => {
      // Here you can use the Data
      let dataXML = responseXML;
      let dataJSON = xmlToJson(dataXML.responseXML);
      // if its not an array then we are not at a valid directory
      if (
        dataJSON["d:multistatus"]["d:response"].constructor.name !== "Array"
      ) {
        console.log("dataJSON", dataJSON);
        setShowMessage("Not a valid directory");
        error();
        setOpenSnackbar2(true);
        setValidDir(false);
        setListOfFiles([]); // clear the list of files since we dont have any
        return;
      }
      setValidDir(true);
      const files = dataJSON["d:multistatus"]["d:response"].map((record) => {
          // console.log("record", record);
          let path = record["d:href"]["#text"],
            isDirectory = Array.isArray(record["d:propstat"]),
            props = record["d:propstat"]["d:prop"],
            dirProps = record["d:propstat"][0]
              ? record["d:propstat"][0]["d:prop"]
              : undefined;
          if (props === undefined) {
            if (dirProps === undefined) return null;
            else props = dirProps;
          }
          const name = props["d:displayname"]["#text"] ?? "",
            created = props["d:creationdate"]
              ? props["d:creationdate"]["#text"]
              : null,
            modified = props["d:getlastmodified"]
              ? props["d:getlastmodified"]["#text"]
              : null,
            checkedOut = props["ns1:checkedOut"]
              ? props["ns1:checkedOut"]["#text"]
              : null,
            locked = props["ns1:locked"] ? props["ns1:locked"]["#text"] : null,
            version = props["ns1:version"]
              ? props["ns1:version"]["#text"]
              : null,
            fileType = path.includes(".") ? path.split(".").pop() : "",
            partOfFile = {
              value: urlPrefix + path,
              fileType: fileType,
              label: isDirectory
                ? name
                : name +
                  (modified ? " (" : "") +
                  (modified ? modified : "") +
                  (modified ? ") " : "") +
                  (checkedOut && checkedOut !== "No" ? "checked-out " : "") +
                  (locked && locked !== "No" ? "locked " : ""),
              // label: name,
              created: created,
              modified: modified,
              checkedOut: checkedOut,
              locked: locked,
              version: version,
              isDirectory: isDirectory,
            };
          return partOfFile;
        }),
        tempListOfFiles = files
          .filter((f) => f !== null && !f.isDirectory)
          .sort((a, b) => {
            const x = a.label.toLowerCase(),
              y = b.label.toLowerCase();
            if (x < y) {
              return -1;
            }
            if (x > y) {
              return 1;
            }
            return 0;
          }),
        tempListOfDirs = files
          .filter((f) => f !== null && f.isDirectory)
          .slice(1)
          .sort((a, b) => {
            const x = a.label.toLowerCase(),
              y = b.label.toLowerCase();
            if (x < y) {
              return -1;
            }
            if (x > y) {
              return 1;
            }
            return 0;
          }),
        filesAndDirs = [...tempListOfDirs, ...tempListOfFiles];

      setListOfFiles(
        filesAndDirs.map((r, id) => {
          r.id = id;
          return r;
        })
      );
      if (filesAndDirs.length === 0) {
        setShowMessage("No files or directories found");
        error();
        setOpenSnackbar2(true);
        setValidDir(false);
      }

      console.log(
        "files",
        files,
        "tempListOfDirs",
        tempListOfDirs,
        "tempListOfFiles",
        tempListOfFiles,
        "filesAndDirs",
        filesAndDirs
      );
    };

  let username = localStorage.getItem("username");

  // useEffect(() => {
  //   if (showOngoingStudies) {
  //     setFilterModel({
  //       items: [{ field: "status", operator: "equals", value: "ongoing" }],
  //     });
  //   } else {
  //     setFilterModel({ items: [] });
  //   }
  // }, [showOngoingStudies]);

  useEffect(() => {
    if (username === null) {
      setTempUsername("");
      setOpenUserLogin(true);
    } else {
      setTempUsername(username);
      setOpenUserLogin(false);
      setOpenSnackbar(true);
    }
  }, [username]);

  useEffect(() => {
    // console.log("window", window);
    if (userList === null) return;
    const matchingUsers = userList.filter(
      (r) => r.userid === tempUsername && ["prg", "prg+ba"].includes(r.profile)
    );
    if (matchingUsers.length > 0) {
      setShowSaveButton(true);
      setUserFullName(matchingUsers[0].Name);
    } else {
      setShowSaveButton(false);
      setUserFullName("");
    }
    // eslint-disable-next-line
  }, [tempUsername]);

  useEffect(() => {
    if (rowsToUse.length === 0 || ready) return;
    console.log("rowsToUse", rowsToUse);
    const tempQf = [params.get("study")];
    setQuickFilterValues(tempQf);

    // add an id to each object in array
    rowsToUse.forEach((e, i) => {
      e.id = i;
      if (e.new_study === "Y" || e.visibleFlag === "N") e.sort = 1;
      else e.sort = 0;
      if (!("status" in e)) e.status = "???";
    });
    // make a copy of the original rows
    const tempOR = JSON.parse(JSON.stringify(rowsToUse));
    // console.log("tempOR", tempOR);
    setOriginalRows(tempOR);
    // sort rowsToUse by sort and then by study_name
    let sorted = JSON.parse(JSON.stringify(rowsToUse));
    sorted.sort((a, b) => {
      if (a.sort < b.sort) return 1;
      if (a.sort > b.sort) return -1;
      if (a.gsdtmflag === "NONE") return -1;
      if (a.studyname < b.studyname) return -1;
      if (a.studyname > b.studyname) return 1;
      return 0;
    });
    setRowsToUse(sorted);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, rowsToUse]);

  useEffect(() => {
    if (!listOfFiles || listOfFiles.length === 0) return;
    const i = listOfFiles[0].value.indexOf("/clinical/"),
      path = listOfFiles[0].value.endsWith("/")
        ? listOfFiles[0].value.slice(i, -1)
        : listOfFiles[0].value.slice(i),
      // ? listOfFiles[0].value.slice(49, -1)
      // : listOfFiles[0].value.slice(49),
      tempCurrentDir = path.split("/").slice(0, -1).join("/"),
      tempParentDir = path.split("/").slice(0, -2).join("/");
    console.log(
      "path",
      path,
      "tempCurrentDir",
      tempCurrentDir,
      "tempParentDir",
      tempParentDir,
      "listOfFiles",
      listOfFiles
    );
    setCurrentDir(tempCurrentDir);
    setParentDir(tempParentDir);
  }, [listOfFiles]);

  // update rowsToUse with selectedPath after the user has modified the path and clicked on the use button
  useEffect(() => {
    if (!selectedPath) return;
    console.log(
      "selectedPath has changed:",
      "selectedPath",
      selectedPath,
      "rowsToUse",
      rowsToUse,
      "selectedId",
      selectedId
    );
    const ind = rowsToUse.findIndex((e) => e.id === selectedId);
    console.log("ind", ind);
    rowsToUse[ind].path = selectedPath;
    rowsToUse[ind].needsCopy = needsCopy;
    setSelectedPath(null);
    setNeedsCopy(null);
    // eslint-disable-next-line
  }, [selectedPath]);

  // update rowsToUse with selectedPathLocked after the user has modified the path and clicked on the use button
  useEffect(() => {
    if (!selectedPathLocked) return;
    console.log(
      "selectedPathLocked has changed:",
      "selectedPathLocked",
      selectedPathLocked,
      "rowsToUse",
      rowsToUse,
      "selectedId",
      selectedId
    );
    const ind = rowsToUse.findIndex((e) => e.id === selectedId);
    console.log("ind", ind);
    if (ind === -1) return;
    rowsToUse[ind].path_locked = selectedPathLocked;
    rowsToUse[ind].needsCopy = needsCopy;
    setSelectedPathLocked(null);
    setNeedsCopy(null);
    // eslint-disable-next-line
  }, [selectedPathLocked]);

  // get data from local or remote
  useEffect(() => {
    if (mode === "local") {
      console.log("assigning local test data");
      setRowsToUse(local_rows);
      setUserList(local_user_list);
      setStudyPeople(local_study_people);
      setSuperUsers(local_super_users);
    } else {
      fetch(dataUrl)
        .then((response) => response.json())
        .then((data) => {
          setRowsToUse(data);
        });
      fetch(usersUrl)
        .then((response) => response.json())
        .then((data) => {
          setUserList(data);
        });
      fetch(peopleUrl)
        .then((response) => response.json())
        .then((data) => {
          setStudyPeople(data);
        });
      fetch(superUserUrl)
        .then((response) => response.json())
        .then((data) => {
          setSuperUsers(data);
        });
    }
  }, [dataUrl, usersUrl, peopleUrl, mode, superUserUrl]);

  useEffect(() => {
    console.log("validDir", validDir);
    if (!validDir) {
      const fid = rowsToUse.findIndex((e) => e.id === selectedId),
        targetDir = rowsToUse[fid]?.path,
        studyLevel = targetDir
          ? targetDir.split("/").slice(0, 5).join("/")
          : null;
      console.log("studyLevel", studyLevel, "targetDir", targetDir, "fid", fid);
      if (studyLevel && !targetDir.includes(".zip"))
        handleClick(studyLevel, -99);
    }
    // eslint-disable-next-line
  }, [validDir]);

  useEffect(() => {
    if (!needToSave) return;
    setTimeout(() => {
      setFlash(!flash);
      tobesaved({ id: "bit" });
    }, 1500);
  }, [needToSave, flash, tobesaved, saved]);

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    setRowsToUse(
      rowsToUse.map((row) => (row.id === newRow.id ? updatedRow : row))
    );
    return updatedRow;
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar variant="dense" sx={{ backgroundColor: "#f7f7f7" }}>
          <Box
            sx={{
              border: 1,
              borderRadius: 2,
              color: "black",
              fontWeight: "bold",
              boxShadow: 3,
              fontSize: 14,
              height: 23,
              padding: 0.3,
            }}
          >
            &nbsp;&nbsp;{title}&nbsp;&nbsp;
          </Box>
          <Tooltip title="Save JSON back to server">
            <Fade in={flash} timeout={1500}>
              <Button
                variant={needToSave ? "contained" : "outlined"}
                // disabled={!allowSave}
                sx={{ m: 1, ml: 2, fontSize: fontSize, height: fontSize + 3 }}
                onClick={() => {
                  saveChanges(dataUrl, rowsToUse);
                  // updateJsonFile(dataUrl, rowsToUse);
                }}
                size="small"
                color="success"
                startIcon={<Save sx={{ fontSize: fontSize }} />}
              >
                Save
              </Button>
            </Fade>
          </Tooltip>
          <Tooltip title="Subscribe to emails about study events">
            <Button
              variant="outlined"
              // disabled={!allowSave}
              sx={{ m: 1, fontSize: fontSize, height: fontSize + 3 }}
              onClick={() => {
                window
                  .open(
                    origin +
                      `/lsaf/filedownload/sdd%3A///general/biostat/tools/subscribe/index.html`,
                    "_blank"
                  )
                  .focus();
              }}
              size="small"
              color="primary"
              startIcon={<AccessAlarm sx={{ fontSize: fontSize }} />}
            >
              Subscribe
            </Button>
          </Tooltip>
          {showGsdtmSwitch && (
            <Tooltip title="View Data Management gSDTM tracking sheet">
              <Button
                variant="outlined"
                // disabled={!allowSave}
                sx={{ m: 1, fontSize: fontSize, height: fontSize + 3 }}
                onClick={() => {
                  window
                    .open(
                      `https://argenxbvba.sharepoint.com/:x:/s/LSAF_OCS-EXTTEAM/EYarxVqhRg1DtsY6A6EvBJYBJe_A7rg6q-m-nLdR-videA?e=sLj51z`,
                      "_blank"
                    )
                    .focus();
                }}
                size="small"
                color="warning"
                startIcon={<ViewHeadline sx={{ fontSize: fontSize }} />}
              >
                Track
              </Button>
            </Tooltip>
          )}
          {showGsdtmSwitch && (
            <Tooltip title="View Data Management gSDTM process flow schedules">
              <Button
                variant="outlined"
                // disabled={!allowSave}
                sx={{ m: 1, fontSize: fontSize, height: fontSize + 3 }}
                onClick={() => {
                  window
                    .open(
                      webDavPrefix +
                        "/general/dm/docs/overview_process_flow_schedules.sas7bdat",
                      "_blank"
                    )
                    .focus();
                }}
                size="small"
                color="warning"
                startIcon={<ViewHeadline sx={{ fontSize: fontSize }} />}
              >
                Flows
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Log from part 1 of the SDTM_last process">
            <Button
              variant="outlined"
              // disabled={!allowSave}
              sx={{ m: 1, fontSize: fontSize, height: fontSize + 3 }}
              onClick={() => {
                window
                  .open(
                    origin +
                      `/lsaf/webdav/repo/general/biostat/tools/logviewer/index.html?log=${origin}/lsaf/webdav/repo/general/biostat/jobs/gadam_ongoing_studies/dev/logs/sdtm_part1.log`,
                    "_blank"
                  )
                  .focus();
              }}
              size="small"
              color="secondary"
              startIcon={<ViewCozy sx={{ fontSize: fontSize }} />}
            >
              Part 1
            </Button>
          </Tooltip>
          <Tooltip title="Log from part 3 of the SDTM_last process">
            <Button
              variant="outlined"
              // disabled={!allowSave}
              sx={{ m: 1, fontSize: fontSize, height: fontSize + 3 }}
              onClick={() => {
                window
                  .open(
                    origin +
                      `/lsaf/webdav/repo/general/biostat/tools/logviewer/index.html?log=${origin}/lsaf/webdav/repo/general/biostat/jobs/gadam_ongoing_studies/dev/logs/sdtm_part3.log`,
                    "_blank"
                  )
                  .focus();
              }}
              size="small"
              color="secondary"
              startIcon={<ViewCozy sx={{ fontSize: fontSize }} />}
            >
              Part 3
            </Button>
          </Tooltip>
          <Tooltip title="Run part 3 of the SDTM_last process which will copy gSDTM & zip files (if needed)">
            <Button
              variant="contained"
              // disabled={!allowSave}
              sx={{ m: 1, fontSize: fontSize, height: fontSize + 3 }}
              onClick={() => {
                window
                  .open(
                    origin +
                      `/lsaf/filedownload/sdd%3A/general/biostat/tools/restapi/index.html?job=/general/biostat/jobs/gadam_ongoing_studies/dev/jobs/sdtm_part3.job&run=y`,
                    "_blank"
                  )
                  .focus();
              }}
              size="small"
              color="secondary"
              startIcon={<DirectionsRun sx={{ fontSize: fontSize }} />}
            >
              Run Part 3
            </Button>
          </Tooltip>
          <Tooltip title="View JSON data using the view tool">
            <IconButton
              color="primary"
              size="small"
              onClick={() => {
                window
                  .open(
                    `https://${server}/lsaf/filedownload/sdd%3A///general/biostat/tools/view/index.html?lsaf=/general/biostat/metadata/projects/sdtm_for_studies.json&readonly=true`
                  )
                  .focus();
              }}
            >
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title="Smaller font">
            <IconButton
              color="primary"
              size="small"
              onClick={() => {
                setFontSize(fontSize - 1);
                localStorage.setItem("fontSize", fontSize - 1);
              }}
            >
              <Remove />
            </IconButton>
          </Tooltip>
          <Box sx={{ color: "#0288d1" }}>&nbsp;{fontSize}&nbsp;</Box>
          <Tooltip title="Larger font">
            <IconButton
              color="primary"
              size="small"
              onClick={() => {
                setFontSize(fontSize + 3);
                localStorage.setItem("fontSize", fontSize + 3);
              }}
            >
              <Add />
            </IconButton>
          </Tooltip>
          <Box sx={{ flexGrow: 1, color: "#0288d1" }}>{jsonPath}</Box>
          <Box sx={{ flexGrow: 1 }}></Box>
          <Tooltip title="Information about this screen">
            <IconButton
              color="info"
              // sx={{ mr: 2 }}
              onClick={() => {
                setOpenInfo(true);
              }}
            >
              <Info />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Grid container>
        <Grid item xs={split ? 9 : 12}>
          <Box sx={{ height: innerHeight - 60, width: "100%" }}>
            {ready && (
              <DataGridPro
                // autoHeight={true}
                // filterModel={filterModel}
                autoPageSize={true}
                getRowHeight={() => 35}
                // getRowHeight={() => "auto"}
                // getEstimatedRowHeight={() => 30}
                rows={rowsToUse}
                columns={cols}
                slots={{ toolbar: CustomToolbar }}
                // slots={{ toolbar: GridToolbar }}
                disableDensitySelector
                // disableColumnFilter
                disableColumnSelector
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                  },
                }}
                apiRef={apiRef}
                processRowUpdate={processRowUpdate}
                sx={{ "& .MuiDataGrid-row": { fontSize: fontSize }, mt: 7 }}
                initialState={{
                  filter: {
                    filterModel: {
                      items: [],
                      quickFilterValues: quickFilterValues,
                    },
                  },
                }}
              />
            )}
          </Box>
        </Grid>
        {split && selected && (
          <Grid item xs={split ? 3 : 12}>
            <Box sx={{ ml: 1, mr: 1, mt: 7 }}>
              <StudyInfo study={selected} />
            </Box>
          </Grid>
        )}
      </Grid>
      {/* dialog that prompts for a user name */}
      {!username && (
        <Dialog
          fullWidth
          maxWidth="sm"
          onClose={() => setOpenUserLogin(false)}
          open={openUserLogin}
          title={"User Login"}
        >
          <DialogTitle>
            <Box>
              {" "}
              {userFullName && userFullName.length > 0
                ? `Hi ${userFullName}! Now you are recognized you can press SAVE.`
                : "Who are you?"}
            </Box>
          </DialogTitle>
          <DialogContent>
            {" "}
            <TextField
              id="input-with-icon-textfield"
              label="User Name"
              placeholder="e.g. pmason"
              value={tempUsername}
              onChange={(e) => {
                setTempUsername(e.target.value);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle />
                  </InputAdornment>
                ),
              }}
              variant="standard"
            />
          </DialogContent>
          <DialogActions>
            {tempUsername && tempUsername > "" && userList.length > 0 && (
              <Button
                sx={{ height: fontSize + 3 }}
                disabled={!showSaveButton}
                onClick={() => saveUser()}
              >
                Save
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
      {tempUsername && (
        <Snackbar
          severity="success"
          open={openSnackbar}
          autoHideDuration={7000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="success"
            sx={{ width: "100%" }}
          >
            Welcome 👨‍🦲 {userFullName} ({username})
          </Alert>
        </Snackbar>
      )}
      {message && (
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message={message}
        />
      )}
      {showMessage && (
        <Snackbar
          open={openSnackbar2}
          autoHideDuration={2000}
          onClose={handleCloseSnackbar2}
          message={showMessage}
        />
      )}
      {/* dialog to select zip files */}
      <Dialog
        fullWidth
        maxWidth="xl"
        onClose={() => setOpenWebdav(false)}
        open={openWebdav}
        title={parentDir}
      >
        <DialogTitle>
          <Tooltip title={"Go up one level"}>
            <IconButton
              onClick={() => {
                handleClick(parentDir, null, "last");
              }}
              color={"info"}
              sx={{ mr: 1 }}
            >
              <ArrowCircleUpTwoTone />
            </IconButton>
          </Tooltip>
          <Tooltip title={"No automatic copying will be done"}>
            <Button
              variant="outlined"
              onClick={() => chooseManual(selectedId)}
              color="error"
            >
              Choose to copy manually
            </Button>
          </Tooltip>
          <Tooltip title={"Email technical programmers"}>
            <IconButton
              onClick={() => {
                window.open(
                  "mailto:qs_tech_prog@argenx.com?subject=Question&body=This email was sent from: " +
                    encodeURIComponent(href) +
                    "%0D%0A%0D%0AMy question is:",
                  "_blank"
                );
              }}
              color={"info"}
              sx={{ mr: 1 }}
            >
              <EmailTwoTone />
            </IconButton>
          </Tooltip>
          {currentDir}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: innerHeight - 200, width: "100%" }}>
            <DataGridPro
              rows={listOfFiles}
              columns={fileCols}
              autoHeight={true}
              autoPageSize={true}
              getRowHeight={() => "auto"}
              density="compact"
              initialState={{
                sorting: {
                  sortModel: [{ field: "created", sort: "desc" }],
                },
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>
      {/* dialog to select SDTM locked folder */}
      <Dialog
        fullWidth
        maxWidth="xl"
        onClose={() => setOpenWebdavLocked(false)}
        open={openWebdavLocked}
        title={parentDir}
      >
        <DialogTitle>
          <Tooltip title={"Go up one level"}>
            <IconButton
              onClick={() => {
                handleClick(parentDir, null, "locked");
              }}
              color={"info"}
              sx={{ mr: 1 }}
            >
              <ArrowCircleUpTwoTone />
            </IconButton>
          </Tooltip>
          <Tooltip title={"Email technical programmers"}>
            <IconButton
              onClick={() => {
                window.open(
                  "mailto:qs_tech_prog@argenx.com?subject=Question&body=This email was sent from: " +
                    encodeURIComponent(href) +
                    "%0D%0A%0D%0AMy question is:",
                  "_blank"
                );
              }}
              color={"info"}
              sx={{ mr: 1 }}
            >
              <EmailTwoTone />
            </IconButton>
          </Tooltip>
          <IconButton
            onClick={() => {
              console.log("Use button pressed: parentDir", currentDir);
              setSelectedPathLocked(currentDir);
              // setNeedsCopy("Y");
              setOpenWebdavLocked(false);
            }}
            color={"info"}
            sx={{ mr: 1, height: fontSize + 3, fontSize: fontSize }}
          >
            <CheckBoxOutlineBlank />
          </IconButton>
          {currentDir}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: innerHeight - 200, width: "100%" }}>
            <DataGridPro
              rows={listOfFiles}
              columns={fileColsLocked}
              autoHeight={true}
              autoPageSize={true}
              getRowHeight={() => "auto"}
              density="compact"
              initialState={{
                sorting: {
                  sortModel: [{ field: "created", sort: "desc" }],
                },
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>
      {/* Dialog with General info about this screen */}
      <Dialog
        fullWidth
        maxWidth="xl"
        onClose={() => setOpenInfo(false)}
        open={openInfo}
      >
        <DialogTitle>
          Info about this screen&nbsp;&nbsp;&nbsp;
          <Tooltip title={"Open User Guide"}>
            <Button
              sx={{
                color: "blue",
                border: 1,
                borderColor: "blue",
                borderRadius: 1,
                padding: 0.4,
                float: "right",
                height: fontSize + 3,
              }}
              onClick={() => {
                window.open(
                  "https://argenxbvba.sharepoint.com/:w:/r/sites/Biostatistics/_layouts/15/Doc.aspx?sourcedoc=%7B4FC2CAE8-FDC0-4344-A4FC-0B3E97DB66D0%7D&file=sdtm-last%20user%20guide.docx",
                  "_blank"
                );
              }}
            >
              User Guide
            </Button>
          </Tooltip>
        </DialogTitle>
        <DialogContent>
          If you want to use gSDTM, then this is currently disabled and can only
          be enabled by notifying the technical programming team, who can enable
          this to automatically be copied each day.
          <p />
          The table has the following columns:
          <Box sx={{ color: "#0288d1", fontSize: 13 }}>
            <ol>
              <li>
                <b>Compound - </b>e.g. argx-113, argx-117, argx-119, etc.
              </li>
              <li>
                <b>Indication - </b>e.g. bp, mg, cidp, etc.
              </li>
              <li>
                <b>Study - </b>e.g. 113-1802
              </li>
              <li>
                <b>Status - </b>Status of study from BIS Tableau dashboard based
                on weekly CRO deliveries.
              </li>
              <li>
                <b>gSDTM? - </b> Switch <b>on</b> indicates whether we are
                copying gSDTM. If <b>off</b> we are using SDTM.
              </li>
              <li>
                <b>Path - </b>Path chosen by user to get data from to copy to
                sdtm_data. When a user saves this information we save the
                date/time and userid in the JSON data, although it is not shown
                in the table. This can also display a blue chip with the
                word&nbsp;
                <b>MANUAL</b> in it. This indicates that no automatic copying
                will be done, but instead any data moved to sdtm_last must be
                moved manually.
              </li>
              <li>
                <b>Actions</b>
                <ul>
                  <li>Choose a path for locked SDTM.</li>
                  <li>
                    View the contents of the path, whether a zip file or folder.
                  </li>
                  <li>
                    View the contents of sdtm_last to see what is currently
                    there.
                  </li>
                  <li>
                    View the SAS log for the job that builds gSDTM data for this
                    study.
                  </li>
                </ul>
              </li>
              <li>
                <b>Date Copied - </b>Shows the date data was copied to
                sdtm_last.
              </li>
              <li>
                <b>OK? - </b>Status of last copy.
              </li>
            </ol>
          </Box>
          <hr />
          {superUsers && superUsers.includes(tempUsername) ? (
            <>
              Enable gSDTM switch (only do this if you know what you are doing!)
              <Switch
                sx={{
                  fontSize: fontSize - 5,
                  border: 0.1,
                  padding: 0.5,
                  mt: 0.1,
                  transform: "scale(0.75)",
                }}
                checked={showGsdtmSwitch}
                onChange={() => setShowGsdtmSwitch(!showGsdtmSwitch)}
                // disabled
              />{" "}
            </>
          ) : null}
          {/* Only show ongoing studies (switch off to see all studies!) */}
          {/* <Switch
            sx={{
              fontSize: fontSize - 5,
              border: 0.1,
              padding: 0.5,
              mt: 0.1,
              transform: "scale(0.75)",
            }}
            checked={showOngoingStudies}
            onChange={() => {
              setShowOngoingStudies(!showOngoingStudies);
              setReady(false);
            }}
            // disabled
          /> */}
          <br />
        </DialogContent>
      </Dialog>
    </>
  );
};
export default App;
