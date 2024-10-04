const express = require('express');
const router = express.Router();
const {Tracking, Stopover} = require('../models/Tracking');
const { Op } = require('sequelize');

/**
 * @swagger
 * /trackings:
 *   post:
 *     summary: Create a tracking ID
 *     tags: [Trackings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fromAddress:
 *                 type: string
 *               deliveryAddress:
 *                 type: string
 *                 nullable: true
 *               deliveryDate:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *               fromDate:
 *                 type: string
 *                 format: date-time
 *               trackingStatus:
 *                 type: string
 *             required:
 *               - fromAddress
 *               - fromDate
 *               - trackingStatus
 *     responses:
 *       201:
 *         description: Tracking ID created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trackingId:
 *                   type: string
 *                 message:
 *                   type: string
 *                 trackingDetails:
 *                   type: object
 *                   properties:
 *                     fromAddress:
 *                       type: string
 *                     deliveryAddress:
 *                       type: string
 *                       nullable: true
 *                     deliveryDate:
 *                       type: string
 *                       format: date-time
 *                     fromDate:
 *                       type: string
 *                       format: date-time
 *                     trackingStatus:
 *                       type: string
 *                     stopovers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           stopoverAddress:
 *                             type: string
 *                           stopoverDate:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: Bad request, missing required fields
 *       500:
 *         description: Error creating tracking
 */
router.post('/trackings', async (req, res) => {
    const { fromAddress, deliveryAddress = null, deliveryDate = null, fromDate, trackingStatus } = req.body;

    if (!fromAddress || !fromDate || !trackingStatus) {
        return res.status(400).json({ message: 'From address, from date, and tracking status are required' });
    }

    try {
        const trackingID = generateTrackingID();

        const newTracking = await Tracking.create({
            trackingId: trackingID,
            fromAddress,
            deliveryAddress,
            deliveryDate,
            fromDate,
            trackingStatus
        });

        res.status(201).json({
            trackingId: newTracking.trackingId,
            message: 'Tracking ID created successfully',
            trackingDetails: {
                fromAddress: newTracking.fromAddress,
                deliveryAddress: newTracking.deliveryAddress,
                deliveryDate: newTracking.deliveryDate,
                fromDate: newTracking.fromDate,
                trackingStatus: newTracking.trackingStatus,
                stopovers: [] // Initially empty
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating tracking', error });
    }
});


/**
 * @swagger
 * /trackings/{trackingId}:
 *   get:
 *     summary: Get tracking information by tracking ID
 *     tags: [Trackings]
 *     parameters:
 *       - in: path
 *         name: trackingId
 *         required: true
 *         description: The tracking ID to fetch information for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tracking information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trackingId:
 *                   type: string
 *                 fromAddress:
 *                   type: string
 *                 deliveryAddress:
 *                   type: string
 *                   nullable: true
 *                 fromDate:
 *                   type: string
 *                   format: date-time
 *                 trackingStatus:
 *                   type: string
 *                 stopovers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       stopoverAddress:
 *                         type: string
 *                       stopoverDate:
 *                         type: string
 *                         format: date-time
 *       404:
 *         description: Tracking ID not found
 *       500:
 *         description: Error fetching tracking information
 */
router.get('/trackings/:trackingId', async (req, res) => {
    const { trackingId } = req.params;

    try {
        const tracking = await Tracking.findOne({
            where: { trackingId },
            include: Stopover // Include stopovers
        });

        if (!tracking) {
            return res.status(404).json({ message: 'Tracking ID not found' });
        }

        res.status(200).json({
            trackingId: tracking.trackingId,
            fromAddress: tracking.fromAddress,
            deliveryAddress: tracking.deliveryAddress,
            fromDate: tracking.fromDate,
            deliveryDate: tracking.deliveryDate,
            trackingStatus: tracking.trackingStatus,
            stopovers: tracking.Stopovers.map(stopover => ({
                stopoverAddress: stopover.stopoverAddress,
                stopoverDate: stopover.stopoverDate
            }))
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tracking information', error });
    }
});


/**
 * @swagger
 * /trackings/{trackingId}/stopovers:
 *   put:
 *     summary: Add a stopover to a tracking ID
 *     tags: [Trackings]
 *     parameters:
 *       - in: path
 *         name: trackingId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stopoverAddress:
 *                 type: string
 *               stopoverDate:
 *                 type: string
 *                 format: date-time
 *             required:
 *               - stopoverAddress
 *               - stopoverDate
 *     responses:
 *       200:
 *         description: Stopover added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 stopover:
 *                   type: object
 *                   properties:
 *                     stopoverAddress:
 *                       type: string
 *                     stopoverDate:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request
 *       404:
 *         description: Tracking ID not found
 *       500:
 *         description: Error adding stopover
 */
router.put('/trackings/:trackingId/stopovers', async (req, res) => {
    const { trackingId } = req.params;
    const { stopoverAddress, stopoverDate } = req.body;

    if (!stopoverAddress || !stopoverDate) {
        return res.status(400).json({ message: 'Stopover address and date are required' });
    }

    try {
        const tracking = await Tracking.findOne({ where: { trackingId } });

        if (!tracking) {
            return res.status(404).json({ message: 'Tracking ID not found' });
        }

        const stopover = await Stopover.create({
            stopoverAddress,
            stopoverDate,
            trackingId: tracking.id
        });

        res.status(200).json({
            message: 'Stopover added successfully',
            stopover: {
                stopoverAddress: stopover.stopoverAddress,
                stopoverDate: stopover.stopoverDate
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding stopover', error });
    }
});


/**
 * @swagger
 * /trackings/{trackingId}/status:
 *   put:
 *     summary: Update tracking status by tracking ID
 *     tags: [Trackings]
 *     parameters:
 *       - in: path
 *         name: trackingId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trackingStatus:
 *                 type: string
 *             required:
 *               - trackingStatus
 *     responses:
 *       200:
 *         description: Tracking status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 trackingId:
 *                   type: string
 *                 trackingStatus:
 *                   type: string
 *       400:
 *         description: Bad request
 *       404:
 *         description: Tracking ID not found
 *       500:
 *         description: Error updating tracking status
 */
router.put('/trackings/:trackingId/status', async (req, res) => {
    const { trackingId } = req.params;
    const { trackingStatus } = req.body;

    if (!trackingStatus) {
        return res.status(400).json({ message: 'Tracking status is required' });
    }

    try {
        const tracking = await Tracking.findOne({ where: { trackingId } });

        if (!tracking) {
            return res.status(404).json({ message: 'Tracking ID not found' });
        }

        tracking.trackingStatus = trackingStatus;
        await tracking.save();

        res.status(200).json({
            message: 'Tracking status updated successfully',
            trackingId: tracking.trackingId,
            trackingStatus: tracking.trackingStatus
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating tracking status', error });
    }
});


/**
 * Generate a tracking ID
 */
function generateTrackingID() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = Math.floor(Math.random() * 4) + 5; // Random length between 5 and 8
    let trackingID = '';

    for (let i = 0; i < length; i++) {
        trackingID += characters.charAt(Math.floor(Math.random() * characters.length));

        if (i < length - 1 && Math.random() < 0.3) { // 30% chance to add a number
            trackingID += Math.floor(Math.random() * 10);
        }
    }

    return trackingID;
}

module.exports = router;
