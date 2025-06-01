import { Avatar } from "antd";
import { getAvatar, getColor, getColorFromInitial } from "../../utils/Utils";

const CustomAvatar = ({ person }) => {
  return (
    <Avatar
      style={{
        backgroundColor: getColorFromInitial(
          person?.name?.[0] || person?.username?.[0]
        ),
        color: getColor(person?.name?.[0] || person?.username?.[0]),
      }}
      size={60}
      src={person?.avatar ? person?.avatar : null}
    >
      {person?.name?.[0] || person?.username?.[0]}
    </Avatar>
  );
};
export { CustomAvatar };
