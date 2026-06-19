import { useCanteen } from "../context/CanteenContext";
import QueueView from "../views/QueueView";

function QueueRoute() {
  const canteen = useCanteen();

  return (
    <QueueView
      queueBoardRef={canteen.queueBoardRef}
      isQueueFullscreen={canteen.isQueueFullscreen}
      queueOrders={canteen.queueOrders}
      readyFlashes={canteen.queueReadyFlashes}
      onToggleQueueFullscreen={canteen.toggleQueueFullscreen}
    />
  );
}

export default QueueRoute;
