import React from 'react';
import "./App.css";
import ImageEditor from "./ImageEditor";

function App() {
  return (
    <div>
      <ImageEditor
        imageUrl={"https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_960_720.jpg"}
        onSave={(dataUrl)=>{
          console.log(dataUrl,"dataUrl")
        }}
      />
    </div>
  );
}

export default App;
