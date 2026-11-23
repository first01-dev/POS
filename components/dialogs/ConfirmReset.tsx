import { Button, Dialog, DialogActions, DialogContentText } from '@mui/material'

interface ConfirmResetProps {
  text: string
  openCancel: boolean
  onCancel: () => void
  onResetSelectedList: () => void
}
export default function ConfirmReset(props: ConfirmResetProps) {
  return (
    <Dialog open={props.openCancel} sx={{ padding: 2 }}>
      <DialogContentText sx={{ padding: 5 }}>{props.text}</DialogContentText>
      <DialogActions sx={{ mb: 2, justifyContent: 'center' }}>
        <Button className="btn-confirm" color="info" variant="contained" onClick={props.onResetSelectedList} autoFocus>
          ยืนยัน
        </Button>
        <Button className="btn-confirm" autoFocus color="warning" variant="contained" onClick={props.onCancel}>
          ยกเลิก
        </Button>
      </DialogActions>
    </Dialog>
  )
}
