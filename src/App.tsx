import { useState } from "react";

export default function () {
  const [i , setI] = useState<number>(0);

  return (
    <div onClick={() => setI(oldI => oldI + 1)}>
      Thing: {i}
    </div>
  );
}
