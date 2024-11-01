import "./App.css";
import React, { useEffect, useState } from "react";
import local_rows from "./sdtm_for_studies.json";
import local_user_list from "./folder_access_request.json";
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
  // Autocomplete,
} from "@mui/material";
import {
  ArrowCircleUpTwoTone,
  CheckCircleTwoTone,
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
  ViewHeadline,
  ContentCopyTwoTone,
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
const App = () => {
  LicenseInfo.setLicenseKey(
    "6b1cacb920025860cc06bcaf75ee7a66Tz05NDY2MixFPTE3NTMyNTMxMDQwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI="
  );
  const urlPrefix = window.location.protocol + "//" + window.location.host,
    apiRef = useGridApiRef(),
    { href } = window.location,
    mode = href.startsWith("http://localhost") ? "local" : "remote",
    server = href.split("//")[1].split("/")[0],
    webDavPrefix = urlPrefix + "/lsaf/webdav/repo",
    fileViewerPrefix = `https://${server}/lsaf/filedownload/sdd:/general/biostat/tools/fileviewer/index.html?file=`,
    logViewerPrefix = `https://${server}/lsaf/filedownload/sdd:/general/biostat/tools/logviewer/index.html?log=`,
    innerHeight = window.innerHeight,
    title = "SDTM for studies",
    jsonPath = "/general/biostat/metadata/projects/sdtm_for_studies.json",
    dataUrl = webDavPrefix + jsonPath,
    usersUrl =
      webDavPrefix +
      "/general/biostat/metadata/projects/folder_access_request.json",
    [rowsToUse, setRowsToUse] = useState([]),
    [originalRows, setOriginalRows] = useState([]),
    [showMessage, setShowMessage] = useState(null),
    [showGsdtmSwitch, setShowGsdtmSwitch] = useState(false),
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
            { new_study, visibleFlag, days_since_last_ae_refresh } = row;
          return (
            <Tooltip
              title={
                "Days since last AE refresh: " + days_since_last_ae_refresh
              }
            >
              <Box
                sx={{
                  backgroundColor:
                    new_study === "Y"
                      ? "#e6ffe6"
                      : visibleFlag === "N"
                      ? "black"
                      : days_since_last_ae_refresh > 28
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
            { new_study, visibleFlag, days_since_last_ae_refresh } = row;
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
                      : days_since_last_ae_refresh > 28
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
        width: 120,
        renderCell: (cellValues) => {
          const { value, row } = cellValues,
            {
              new_study,
              visibleFlag,
              protocol_name,
              days_since_last_ae_refresh,
            } = row;
          return (
            <Tooltip title={protocol_name}>
              <Box
                sx={{
                  fontSize: fontSize,
                  backgroundColor:
                    visibleFlag === "N"
                      ? "black"
                      : new_study === "Y"
                      ? "#e6ffe6"
                      : days_since_last_ae_refresh > 28
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
                    handleClick(value, id);
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
                  handleClick(value, id);
                }}
              >
                Choose path
              </Button>
            );
        },
      },

      {
        field: "id",
        headerName: "View",
        width: 120,
        renderCell: (cellValues) => {
          const { row } = cellValues,
            { path, compound, indication, studyname } = row;

          return (
            <>
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
                  disabled
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
        renderCell: (cellValues) => {
          const { value, row } = cellValues,
            { username, userFullName } = row;
          return (
            <Tooltip
              title={
                username
                  ? "copied by " + userFullName + " (" + username + ")"
                  : "null"
              }
            >
              <Box>{value}</Box>
            </Tooltip>
          );
        },
      },
      {
        field: "statusoflastcopy",
        headerName: "OK?",
        width: 70,
        renderCell: (cellValues) => {
          const { value } = cellValues;
          return (
            <Box
              sx={{
                backgroundColor: value === "Passed" ? "#e6ffe6" : "#ffe6e6",
                // color: visibleFlag === "N" ? "white" : "black",
              }}
            >
              {value}
            </Box>
          );
        },
      },
    ],
    [fontSize, setFontSize] = useState(
      Number(localStorage.getItem("fontSize")) || 10
    ),
    // columns used in popup letting users pick files/paths
    fileCols = [
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
                    handleClick(path);
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
      {
        field: "fileType",
        headerName: "Use",
        width: 50,
        renderCell: (cellValues) => {
          const { row } = cellValues,
            { value } = row,
            path =
              value.indexOf("/repo/") > 0
                ? value.slice(value.indexOf("/repo/") + 5)
                : value;
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
                <CheckCircleTwoTone />
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
                : value;
          let cell;
          if (isDirectory) cell = <Box sx={{ color: "blue" }}>{path}</Box>;
          else cell = <Box sx={{ color: "black" }}>{path}</Box>;
          return cell;
        },
      },
    ],
    [selectedId, setSelectedId] = useState(null),
    handleClick = (path, id) => {
      let pathArray = path.split("/").filter((e, ind) => ind === 0 || e),
        fid = rowsToUse.findIndex((e) => e.id === id);
      console.log(
        "id",
        id,
        "fid",
        fid,
        "rowsToUse",
        rowsToUse,
        "path",
        path,
        "pathArray",
        pathArray
      );
      let pathToUse;
      const row = rowsToUse[fid],
        compound = row?.compound || pathArray[2],
        indication = row?.indication || pathArray[3],
        studyname = row?.studyname || pathArray[4];
      console.log(
        "row",
        row,
        "compound",
        compound,
        "indication",
        indication,
        "studyname",
        studyname
      );
      if (
        !path.includes(".zip") &&
        path.includes("/dm/staging/transfers") &&
        pathArray.length > 7
      ) {
        pathToUse = path;
      } else
        pathToUse = `/clinical/${compound}/${indication}/${studyname}/dm/staging/transfers`;
      //TODO: if path has a .zip at the end, then remove the last part so we just lookup the dir
      setCurrentDir(pathToUse);
      setParentDir(pathToUse.split("/").slice(0, -1).join("/"));
      // if (pathArray.length < 5) {
      //   pathToUse = `/clinical/${compound}/${indication}/${studyname}/dm/staging/transfers`;
      // } else if (pathArray.length > 8) {
      //     pathToUse = pathArray.slice(0, -1).join("/");
      // } else if (pathArray.length > 5) {
      //   pathToUse = pathArray.slice(0, 5).join("/") + "/dm/staging/transfers";
      // } else if (pathArray.length === 5 && id !== -99) {
      //   pathToUse = path + "/dm/staging/transfers";
      // }
      setOpenWebdav(true);
      if (id) setSelectedId(id);
      console.log("pathToUse", pathToUse, "id", id);
      getWebDav(pathToUse);
    },
    handleSwitch = (value, id) => {
      if (id) setSelectedId(id);
      console.log("value", value, "id", id);
      const ind = rowsToUse.findIndex((e) => e.id === id);
      console.log("id", id, "ind", ind, "value", value);
      rowsToUse[ind].gsdtmflag = value;
      if (value || value === 1 || value === "Y") rowsToUse[ind].path = "";
      console.log("rowsToUse[ind]", rowsToUse[ind]);
    },
    [selectedPath, setSelectedPath] = useState(null),
    [needsCopy, setNeedsCopy] = useState(null),
    [listOfFiles, setListOfFiles] = useState([{ value: "topDir", id: 0 }]),
    [currentDir, setCurrentDir] = useState(""),
    [parentDir, setParentDir] = useState(""),
    [openWebdav, setOpenWebdav] = useState(false),
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
              response.text().then(function (text) {
                console.log("text", text);
              });
            })
            .catch((err) => {
              setMessage(err);
              setOpenSnackbar(true);
              console.log("PUT err: ", err);
            });
        })
        .catch((err) => {
          setMessage(
            "DELETE was attempted before the new version was saved - but the DELETE failed. (see console)"
          );
          setOpenSnackbar(true);
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
              "https://xarprod.ondemand.sas.com/lsaf/webdav/repo/clinical/argx-110/aml/argx-110-0000/",
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
              "https://xarprod.ondemand.sas.com/lsaf/webdav/repo/clinical/argx-110/aml/argx-110-0000/biostat/",
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
              "https://xarprod.ondemand.sas.com/lsaf/webdav/repo/clinical/argx-110/aml/argx-110-0000/dm/",
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
              "https://xarprod.ondemand.sas.com/lsaf/webdav/repo/clinical/argx-113/cidp/argx-113-1902/dm/staging/transfers/2021-07-06_argx-113-1902_sdtm.zip",
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
      setOpenSnackbar2(true);
      setOpenWebdav(false);
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
        setOpenSnackbar2(true);
        setValidDir(false);
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
  }, [ready, rowsToUse]);

  useEffect(() => {
    if (!listOfFiles || listOfFiles.length === 0) return;
    const path = listOfFiles[0].value.endsWith("/")
        ? listOfFiles[0].value.slice(49, -1)
        : listOfFiles[0].value.slice(49),
      tempCurrentDir = path.split("/").slice(0, -1).join("/"),
      tempParentDir = path.split("/").slice(0, -2).join("/");
    console.log(
      "path",
      path,
      "tempCurrentDir",
      tempCurrentDir,
      "tempParentDir",
      tempParentDir
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

  // get data from local or remote
  useEffect(() => {
    if (mode === "local") {
      console.log("assigning local test data");
      setRowsToUse(local_rows);
      setUserList(local_user_list);
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
    }
  }, [dataUrl, usersUrl, mode]);

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
    }, 3000);
  }, [needToSave, flash]);

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
              gSDTM
            </Button>
          </Tooltip>
          <Tooltip title="Log from part 1 of the SDTM_last process">
            <Button
              variant="outlined"
              // disabled={!allowSave}
              sx={{ m: 1, fontSize: fontSize, height: fontSize + 3 }}
              onClick={() => {
                window
                  .open(
                    `https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/tools/logviewer/index.html?log=https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/jobs/gadam_ongoing_studies/dev/logs/sdtm_part1.log`,
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
                    `https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/tools/logviewer/index.html?log=https://xarprod.ondemand.sas.com/lsaf/webdav/repo/general/biostat/jobs/gadam_ongoing_studies/dev/logs/sdtm_part3.log`,
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

          <Tooltip title="View JSON data using the view tool">
            <IconButton
              color="primary"
              size="small"
              onClick={() => {
                window
                  .open(
                    `https://${server}/lsaf/filedownload/sdd%3A///general/biostat/tools/view/index.html?lsaf=/general/biostat/metadata/projects/sdtm_for_studies.json`
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
        <Grid item xs={12}>
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
              />
            )}
          </Box>
        </Grid>
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
      )}{" "}
      {showMessage && (
        <Snackbar
          open={openSnackbar2}
          autoHideDuration={2000}
          onClose={handleCloseSnackbar2}
          message={showMessage}
        />
      )}{" "}
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
                handleClick(parentDir);
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

          {/* <IconButton
            onClick={() => {
              console.log("Use button pressed: parentDir", currentDir);
              setSelectedPath(currentDir);
              setNeedsCopy("Y");
              setOpenWebdav(false);
            }}
            color={"info"}
            sx={{ mr: 1, height: fontSize + 3, fontSize: fontSize }}
          >
            <CheckCircleTwoTone />
          </IconButton> */}
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
                in the table.
              </li>
              <li>
                <ul>
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
          {[
            "pmason",
            "dvankrunckelsven",
            "mbusselen",
            "pschrauben",
            "jbodart",
            "rwoodiwiss",
            "fbuerger",
          ].includes(tempUsername) ? (
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
