import { AXIS } from "../../utils/DB";

const Inventory = ({
  playerAvailableShips,
  handleSelectShipToPlace,
  selectedShipToPlace,
  playersSelectedAxis,
  onSelectAxis
}) => {
  return (
    <div>
      <div className="inventory__title mt-4">Place your ships to start the game</div>
      <div className="inventory__content">
        <div className="flex items-center space-x-2">
          <button
            className={
              `${playersSelectedAxis === AXIS.horizontal ? "bg-cyan-500  border-white" : "border-white"} text-white border px-4 py-2 mt-4 font-semibold text-sm  shadow-sm flex space-x-2 items-center justify-center`
            }
            onClick={() => onSelectAxis(AXIS.horizontal)}
          >
            Horizontal
          </button>
          <button
            className={
              `${playersSelectedAxis === AXIS.vertical ? "bg-cyan-500  border-white" : "border-white"} text-white border px-4 py-2 mt-4 font-semibold text-sm  shadow-sm flex space-x-2 items-center justify-center`
            }
            onClick={() => onSelectAxis(AXIS.vertical)}
          >
            Vertical
          </button>
        </div>
        <div className="mt-4 flex items-center space-x-2">
        {playerAvailableShips.map((ship) => {
          return (
            <div
              key={ship.name}
              id={ship.name}
              className={`inventory__item ${
                selectedShipToPlace && selectedShipToPlace.name === ship.name
                  ? "selected"
                  : ""
              }
               `}
              onClick={() => handleSelectShipToPlace(ship)}
            >
              <span className="inventory__item--name"> {ship.name} </span>
              <div className="inventory__item--container--smallbox">
                {Array(ship.shipLength)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="inventory__item--smallbox"></div>
                  ))}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
