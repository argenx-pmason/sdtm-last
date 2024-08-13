import "./App.css";
import React, { useEffect, useState } from "react";
import local_rows from "./sdtm_for_studies.json";
import local_user_holidays from "./user_holidays.json";
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
  InputAdornment,
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
  Search,
} from "@mui/icons-material";
import { DataGridPro, GridToolbar } from "@mui/x-data-grid-pro";
import { getDir, xmlToJson } from "./utility";
import { LicenseInfo } from "@mui/x-license-pro";
const App = () => {
  LicenseInfo.setLicenseKey(
    "6b1cacb920025860cc06bcaf75ee7a66Tz05NDY2MixFPTE3NTMyNTMxMDQwMDAsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI="
  );
  const urlPrefix = window.location.protocol + "//" + window.location.host,
    { href } = window.location,
    mode = href.startsWith("http://localhost") ? "local" : "remote",
    server = href.split("//")[1].split("/")[0],
    webDavPrefix = urlPrefix + "/lsaf/webdav/repo",
    fileViewerPrefix = `https://${server}/lsaf/filedownload/sdd:/general/biostat/tools/fileviewer/index.html?file=`,
    innerHeight = window.innerHeight,
    title = "SDTM for studies",
    jsonPath =
      "/general/biostat/jobs/gadam_ongoing_studies/dev/output/sdtm_for_studies.json",
    dataUrl = webDavPrefix + jsonPath,
    usersUrl =
      webDavPrefix + "/general/biostat/metadata/projects/rm/user_holidays.json",
    [rowsToUse, setRowsToUse] = useState([]),
    [originalRows, setOriginalRows] = useState([]),
    options = [
      { label: "SDTM", value: "SDTM" },
      { label: "GSDTM", value: "GSDTM" },
      { label: "NONE", value: "NONE" },
    ],
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
    [showSaveButton, setShowSaveButton] = useState(false),
    [userList, setUserList] = useState(null),
    handleCloseSnackbar = (event, reason) => {
      if (reason === "clickaway") {
        return;
      }
      setOpenSnackbar(false);
    },
    cols = [
      {
        field: "compound",
        headerName: "Compound",
      },
      {
        field: "indication",
        headerName: "Indication",
      },
      {
        field: "studyname",
        headerName: "Study",
        width: 120,
      },
      {
        field: "dateFirstVisible",
        headerName: "First visible",
      },
      {
        field: "dateLastVisible",
        headerName: "Last visible",
      },
      {
        field: "blockedDate",
        headerName: "Blocked",
      },
      {
        field: "gSDTMflag",
        editable: true,
        headerName: "gSDTM?",
        width: 150,
        type: "singleSelect",
        valueOptions: options,
      },
      {
        field: "path",
        editable: true,
        headerName: "Path",
        flex: 1,
        renderCell: (cellValues) => {
          const { value, row } = cellValues,
            { id, new_study } = row;
          return (
            <Button
              sx={{
                fontSize: fontSize,
                // height: fontSize + 3,
                backgroundColor: new_study === "Y" ? "yellow" : "white",
              }}
              onClick={() => {
                console.log("id", id);
                setSelectedId(id);
                handleClick(value, id);
              }}
            >
              {value}
            </Button>
          );
        },
      },
      {
        field: "id",
        headerName: "FileViewer",
        renderCell: (cellValues) => {
          const { row } = cellValues,
            { path } = row;
          return (
            <>
              <IconButton
                sx={{ height: fontSize + 3, fontSize: fontSize }}
                onClick={() => {
                  window.open(`${fileViewerPrefix}${path}`, "_blank").focus();
                }}
                size="small"
              >
                <Search />
              </IconButton>
            </>
          );
        },
      },
      {
        field: "new_study",
        headerName: "New?",
        renderCell: (cellValues) => {
          const { value } = cellValues;
          return (
            <Box sx={{ backgroundColor: value === "Y" ? "yellow" : "white" }}>
              {value}
            </Box>
          );
        },
      },
      {
        field: "visibleFlag",
        headerName: "Visible?",
        renderCell: (cellValues) => {
          const { value } = cellValues;
          return (
            <Box sx={{ backgroundColor: value === "N" ? "#ffeeee" : "white" }}>
              {value}
            </Box>
          );
        },
      },
    ],
    [fontSize, setFontSize] = useState(
      Number(localStorage.getItem("fontSize")) || 10
    ),
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
          else cell = <Box sx={{ color: "black" }}>{value}</Box>;
          return cell;
        },
      },
      {
        field: "fileType",
        headerName: "Use?",
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
                  "Use? button pressed: ",
                  "path",
                  path,
                  "value",
                  value,
                  "row",
                  row
                );
                setSelectedPath(path);
                setOpenWebdav(false);
              }}
              color={"info"}
              size="small"
              sx={{ mr: 1, height: fontSize + 3, fontSize: fontSize }}
            >
              <CheckCircleTwoTone />
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
      setOpenWebdav(true);
      if (id) setSelectedId(id);
      console.log("path", path, "id", id);
      getWebDav(path);
    },
    [selectedPath, setSelectedPath] = useState(null),
    [listOfFiles, setListOfFiles] = useState([{ value: "topDir", id: 0 }]),
    [currentDir, setCurrentDir] = useState(""),
    [parentDir, setParentDir] = useState(""),
    [openWebdav, setOpenWebdav] = useState(false),
    [message, setMessage] = useState(null),
    updateJsonFile = (file, content) => {
      console.log("updateJsonFile - file:", file, "content:", content);
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
        // console.log(
        //   "originalRows",
        //   originalRows,
        //   "rowFromTable",
        //   rowFromTable,
        //   "originalRow",
        //   originalRow,
        //   "id",
        //   id
        // );
        let writeRow = false;
        if (originalRow.gSDTMflag !== rowFromTable.gSDTMflag) {
          console.log(
            "gSDTMflag changed to: ",
            rowFromTable.gSDTMflag,
            ", from: ",
            originalRow.gSDTMflag
          );
          write = true;
          writeRow = true;
        }
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
      } else await getDir(webDavPrefix + dir, 1, processXml);
    },
    // [thisIsADir, setThisIsADir] = useState(false),
    processXml = (responseXML) => {
      // Here you can use the Data
      let dataXML = responseXML;
      let dataJSON = xmlToJson(dataXML.responseXML);
      // if its not an array then we are not at a valid directory
      if (
        dataJSON["d:multistatus"]["d:response"].constructor.name !== "Array"
      ) {
        console.log("dataJSON", dataJSON);
        // setThisIsADir(false);
        return;
      }
      // setThisIsADir(true);
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
    const matchingUsers = userList.users.filter(
      (r) => r.userid === tempUsername
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
    // console.log("rowsToUse", rowsToUse);
    // add an id to each object in array
    rowsToUse.forEach((e, i) => {
      e.id = i;
      if (e.new_study === "Y" || e.visibleFlag === "N") e.sort = 1;
      else e.sort = 0;
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
      if (a.gSDTMflag === "NONE") return -1;
      if (a.studyname < b.studyname) return -1;
      if (a.studyname > b.studyname) return 1;
      return 0;
    });
    setRowsToUse(sorted);
    setReady(true);
  }, [ready, rowsToUse]);

  useEffect(() => {
    if (!listOfFiles || listOfFiles.length === 0) return;
    const path = listOfFiles[0].value.slice(49),
      tempCurrentDir = path.split("/").slice(0, -2).join("/"),
      tempParentDir = path.split("/").slice(0, -3).join("/");
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
    setSelectedPath(null);
    // eslint-disable-next-line
  }, [selectedPath]);

  // get data from local or remote
  useEffect(() => {
    if (mode === "local") {
      console.log("assigning local test data");
      setRowsToUse(local_rows);
      setUserList(local_user_holidays);
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
            <Button
              variant="contained"
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
          </Tooltip>
          <Tooltip title="View Data Management gSDTM tracking sheet">
            <Button
              variant="contained"
              // disabled={!allowSave}
              sx={{ m: 1, ml: 2, fontSize: fontSize, height: fontSize + 3 }}
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
              startIcon={<Save sx={{ fontSize: fontSize }} />}
            >
              gSDTM
            </Button>
          </Tooltip>
          <Tooltip title="View JSON data using the view tool">
            <IconButton
              color="primary"
              size="small"
              onClick={() => {
                window
                  .open(
                    `https://${server}/lsaf/filedownload/sdd%3A///general/biostat/tools/view/index.html?lsaf=/general/biostat/jobs/gadam_ongoing_studies/dev/output/sdtm_for_studies.json`
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
          <Box sx={{ flexGrow: 1 }}>{jsonPath}</Box>
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
          <Box sx={{ height: innerHeight - 50, width: "100%" }}>
            {ready && (
              <DataGridPro
                // autoHeight={true}
                autoPageSize={true}
                getRowHeight={() => "auto"}
                rows={rowsToUse}
                columns={cols}
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,
                  },
                }}
                processRowUpdate={processRowUpdate}
                sx={{ "& .MuiDataGrid-row": { fontSize: fontSize } }}
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
            {tempUsername &&
              tempUsername > "" &&
              userList.users &&
              userList.users.length > 0 && (
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
      <Dialog
        fullWidth
        maxWidth="xl"
        onClose={() => setOpenWebdav(false)}
        open={openWebdav}
        title={currentDir}
      >
        <DialogTitle>
          <IconButton
            onClick={() => {
              handleClick(parentDir);
            }}
            color={"info"}
            sx={{ mr: 1 }}
          >
            <ArrowCircleUpTwoTone />
          </IconButton>
          <IconButton
            onClick={() => {
              console.log("Use? button pressed: parentDir", currentDir);
              setSelectedPath(currentDir);
              setOpenWebdav(false);
            }}
            color={"info"}
            sx={{ mr: 1, height: fontSize + 3, fontSize: fontSize }}
          >
            <CheckCircleTwoTone />
          </IconButton>
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
            />
          </Box>
          <Tooltip title={"Email technical programmers"}>
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
                  "mailto:qs_tech_prog@argenx.com?subject=Question&body=This email was sent from: " +
                    encodeURIComponent(href) +
                    "%0D%0A%0D%0AMy question is:",
                  "_blank"
                );
              }}
            >
              Email
            </Button>
          </Tooltip>
        </DialogContent>
      </Dialog>
      {/* Dialog with General info about this screen */}
      <Dialog
        fullWidth
        maxWidth="xl"
        onClose={() => setOpenInfo(false)}
        open={openInfo}
      >
        <DialogTitle>Info about this screen</DialogTitle>
        <DialogContent>
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
                <b>First visible - </b>Date study was first visible in this
                system
              </li>
              <li>
                <b>Last visibile - </b>Date study was last visible, which can
                indicate that a study has become inaccessible due to being
                hidden for unblinding (for example)
              </li>
              <li>
                <b>Blocked - </b>Date the study was last blocked from use. This
                is maintained when the study becomes visible again so that we
                can see it was blocked in the past
              </li>
              <li>
                <b>gSDTM - </b> Decide where to take sdtm_last data from. gSDTM?
                column should have one of 3 values:
                <ul>
                  <li>
                    <b>NONE</b> - meaning we don't copy anything to sdtm_last
                  </li>
                  <li>
                    <b>SDTM</b> - means that we will copy SDTM data from the
                    path specified to sdtm_last. This will be done once by the
                    sdtm_part3 job that runs each day.
                  </li>
                  <li>
                    <b>gSDTM</b> - means that we will copy gSDTM data from the
                    path specified to sdtm_last. This will be done each time new
                    data is found by the sdtm_part3 job that runs each day.
                  </li>
                </ul>
              </li>
              <li>
                <b>Path - </b>Path chosen by user to get data from to copy to
                sdtm_data. When a user saves this information we save the
                date/time and userid in the JSON data, although it is not shown
                in the table.
              </li>
              <li>
                <b>FileViewer - </b>View the path in the File Viewer, which is
                sometimes easier to then explore the file system to find the
                right place set choose as a path.
              </li>
              <li>
                <b>New? - </b>This is set to Y when the last load of data
                discovered this study for the first time.
              </li>
              <li>
                <b>Visible? - </b>This indicates that the study is visible in
                the system. If it is not visible it is because it has been
                blocked from view for some reason.
              </li>
            </ol>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default App;
