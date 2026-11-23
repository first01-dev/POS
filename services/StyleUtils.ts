import { InputBase, Paper, Switch, TableCell, TableRow, tableCellClasses } from '@mui/material'
import { styled } from '@mui/material/styles'
import Success from '../assets/images/Animation - 1698313055442.json'
import * as Background from '../assets/images/Animation - 1727866563534.json'
import * as EmptyRed from '../assets/images/Empty-red.json'
import * as Booking from '../assets/images/loading.json'
const Search = styled('div')(({ theme }) => ({
    position: 'relative',

    backgroundColor: '#FFFFFF',
    height: 50,
    marginRight: theme.spacing(2),

    width: '100%',
    [theme.breakpoints.up('sm')]: {
   
      width: 'auto',
    },
  }))
  
  
const SearchIconWrapper = styled('div')(({ theme }) => ({

  height: '100%',
  width: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const SelectInputBase = styled(InputBase)(({ theme }) => ({
  fontSize: '16px',
  backgroundColor: '#FFFFFF',
  '& .MuiInputBase-input': {
    padding: theme.spacing(0, 0, 0, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(0)})`,
    transition: theme.transitions.create('width'),
  },
}))

const loadingAnimation = {
  loop: true,
  autoplay: true,
  animationData: Booking,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
}

const loadingAnimationSuccess = {
  loop: false,
  autoplay: true,
  animationData: Success,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
}

const emptyRed = {
  loop: true,
  autoplay: true,
  animationData: EmptyRed,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
}

const backGroudAnimation = {
  loop: true,
  autoplay: true,
  animationData: Background,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice',
  },
}
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#F1F1F1',
    color: theme.palette.warning,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}))

const IOSSwitch = styled(Switch)(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.mode === 'dark' ? '#2ECA45' : '#65C466',
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#33cf4d',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color:
        theme.palette.mode === 'light'
          ? theme.palette.grey[100]
          : theme.palette.grey[600],
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 22,
    height: 22,
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));

const Item = styled(Paper)(({ theme }) => ({
paddingLeft:"10px",
  textAlign: 'left',
  boxShadow:"none"
}));

export { IOSSwitch, Item, Search, SearchIconWrapper, SelectInputBase, StyledTableCell, StyledTableRow, backGroudAnimation, emptyRed, loadingAnimation, loadingAnimationSuccess }

