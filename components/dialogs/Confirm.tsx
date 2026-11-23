import { Button, Dialog, DialogActions, DialogContentText } from "@mui/material";

interface ConfirmProps{
    text:string
    open : boolean
    loadingSubmit : boolean

    onSubmitStockOut:()=>void
    onClose:()=> void
}
export default function Confirm(props:ConfirmProps){
    return(
        <Dialog open={props.open} sx={{ padding: 2 }}>
        <DialogContentText sx={{ padding: 5 }}>{props.text}</DialogContentText>
        <DialogActions sx={{ mb: 2, justifyContent: 'center' }}>
          <Button
            className="btn-confirm"
            loading={props.loadingSubmit}
            color="info"
            variant="contained"
            autoFocus
            onClick={props.onSubmitStockOut}>
            ยืนยัน
          </Button>
          <Button
            className="btn-confirm"
            autoFocus
            color="warning"
            variant="contained"
            onClick={()=>props.onClose}>
            ยกเลิก
          </Button>
        </DialogActions>
      
      
      </Dialog>
    )
}