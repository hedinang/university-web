import { Avatar } from "antd";
import { getColor, getColorFromInitial } from "../../utils/Utils";

const fileStore =
  process.env.REACT_APP_FILE_STORE || "http://localhost:9000/media/";
const CustomAvatar = ({ person }) => {
  return (
    <Avatar
      style={{
        backgroundColor: getColorFromInitial(
          person?.name?.[0] || person?.username?.[0]
        ),
        color: getColor(person?.name?.[0] || person?.username?.[0]),
      }}
      size={50}
      src={person?.avatar ? fileStore + person?.avatar : null}
    >
      {person?.name?.[0] || person?.username?.[0]}
    </Avatar>
  );
};
export { CustomAvatar };
