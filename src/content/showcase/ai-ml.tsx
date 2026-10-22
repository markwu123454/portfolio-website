import { Brief, Shot } from '@/app/components/project/media';
import { defineShowcase } from './types';
import broadcastSplit from '../projects/sprocketstats/v3/broadcast-view-split.png';
import fieldTags from '../projects/sprocketstats/v3/webcast-apriltags.png';
import tracking from '../projects/sprocketstats/yolo-bytetrack-tracking.png';
import keypoints from '../projects/sprocketstats/v3/hrnet-keypoints.png';
import trajectories from '../projects/sprocketstats/v3/field-trajectories.png';
import multiCamera from '../projects/sprocketstats/v3/multi-camera-solve.png';
import gamePieces from '../projects/sprocketstats/v3/game-piece-detection.png';
import templateMatching from '../projects/sprocketstats/v3/template-matching-debug.png';
import scoutingApp from '../projects/sprocketstats/scouting-app-2026-event2.png';
import matchReview from '../projects/sprocketstats/scouting-2026.png';

export default defineShowcase({
    slug: 'ai-ml',
    num: '#S02',
    topic: 'AI / ML',
    title: 'Scouting from video.',
    subtitle: 'Computer vision for FRC.',
    description: 'Applied ML for FRC scouting: match prediction, and a computer-vision rebuild with broadcast alignment and field mapping done and robot detection, tracking and pose unfinished.',

    stats: [
        { label: 'Prediction', value: '~87% win/loss' },
        { label: 'vs Statbotics', value: 'No sig. difference' },
        { label: 'Models', value: 'YOLO · ByteTrack · HRNet' },
        { label: 'Data', value: '218 matches · 73 teams' },
    ],

    feature: {
        title: 'SprocketStats v3',
        caption: 'Three broadcast feeds from the 2026 Einstein finals, with field tags detected.',
        media: (
            <Shot
                src={broadcastSplit}
                alt="2026 Einstein final broadcast split into the main feed and two lower camera feeds, with numbered field tags marked in red."
                priority
            />
        ),
        href: '/projects/sprocketstats',
    },

    tiles: [
        {
            title: 'Robot tracking',
            caption: 'YOLO + ByteTrack detection and tracking, unfinished at handoff.',
            media: <Shot src={tracking} alt="Competition broadcast with a labelled box around every robot, such as “blue 0.82” and “red 0.86”." />,
            href: '/projects/sprocketstats',
            span: 'wide',
        },
        {
            title: 'Camera solve',
            caption: 'All three camera poses solved from field tags.',
            media: <Shot src={multiCamera} fit="contain" alt="Top-down field outline with three solved camera positions and dashed rays to numbered field tags." />,
            href: '/projects/sprocketstats',
        },
        {
            title: 'Field projection',
            caption: 'Field tags and the projected field boundary on the main feed.',
            media: <Shot src={fieldTags} alt="Main broadcast feed with field tags boxed in green and orange and the projected field boundary drawn in orange." />,
            href: '/projects/sprocketstats',
            span: 'wide',
        },
        {
            title: 'Match prediction',
            caption: 'Ensemble predictor, tested on ~90 late-event matches.',
            media: (
                <Brief
                    items={[
                        ['Win / loss', '~87% predicted'],
                        ['vs Statbotics', 'No significant difference'],
                    ]}
                />
            ),
            href: '/projects/sprocketstats',
        },
        {
            title: 'Keypoints',
            caption: 'HRNet pose estimation for each robot’s centre, unfinished at handoff.',
            media: <Shot src={keypoints} alt="Reefscape broadcast frame from the Curie Division, used for HRNet keypoint detection." />,
            href: '/projects/sprocketstats',
        },
        {
            title: 'Trajectories',
            caption: 'Robot paths mapped onto field coordinates.',
            media: <Shot src={trajectories} alt="Top-down field map covered in red and blue robot paths." />,
            href: '/projects/sprocketstats',
        },
        {
            title: 'Game pieces',
            caption: 'Detecting game pieces across the field.',
            media: <Shot src={gamePieces} alt="Broadcast frame with game pieces detected." />,
            href: '/projects/sprocketstats',
        },
        {
            title: 'Score reading',
            caption: 'Template matching on the broadcast score digits.',
            media: <Shot src={templateMatching} fit="contain" alt="Template matching debug view: score digits with match scores drawn over each one." />,
            href: '/projects/sprocketstats',
        },
        {
            title: 'Scouting app',
            caption: 'The manual input v3 was meant to replace.',
            media: <Shot src={scoutingApp} alt="Scouting app mid-match: task buttons on the left, field map in the middle, made and missed shot sliders on the right." />,
            href: '/projects/sprocketstats',
        },
        {
            title: 'Match review',
            caption: 'Per-robot contributions from scouted data.',
            media: <Shot src={matchReview} alt="Match review: red and blue bars comparing each robot’s scouted contributions." />,
            href: '/projects/sprocketstats',
        },
    ],
});
